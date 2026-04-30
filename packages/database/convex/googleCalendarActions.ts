import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { URL_GOOGLE_CALENDAR_EVENTS, URL_GOOGLE_CALENDAR_TOKEN } from "./constants";

export const exchangeToken = action({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Missing Google credentials in environment variables");
    }

    const tokenResponse = await fetch(URL_GOOGLE_CALENDAR_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code: args.code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Failed to exchange token:", errorText);
      throw new Error(`Failed to exchange token: ${tokenResponse.status}`);
    }

    const data = await tokenResponse.json();
    
    // We only expect a refresh token on the first connection (prompt=consent)
    // If it's missing, it implies the user already connected before.
    if (!data.access_token) {
      throw new Error("No access token returned from Google");
    }

    // Now call an internal mutation or helper to encrypt and save.
    // However, encryption requires WebCrypto which is available here in Edge runtime!
    // But since `encryptToken` is in `lib/encryption.ts`, we can just import and use it.
    // Let's use the internal lib.
    
    // Workaround since we can't top-level await or dynamically import easily:
    // We can just define the encryption inline or import the function.
    // Let's import the function.
    const { encryptToken } = await import("./lib/encryption.js");

    const encryptedAccessToken = await encryptToken(data.access_token);
    // If no refresh_token is returned, we should probably fail or handle it.
    // Assuming prompt=consent always returns it.
    const encryptedRefreshToken = data.refresh_token ? await encryptToken(data.refresh_token) : "";
    const tokenExpiry = Date.now() + (data.expires_in * 1000);

    // Save tokens via mutation
    await ctx.runMutation(api.googleCalendarTokens.saveTokens, {
      encryptedAccessToken,
      encryptedRefreshToken,
      tokenExpiry,
    });

    // Optionally trigger initial sync here
    await ctx.runAction(api.googleCalendarActions.syncEvents, {});

    return { success: true };
  },
});

export const syncEvents = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const doctorClerkId = identity.subject;

    const tokens = await ctx.runQuery(internal.googleCalendarTokens.getTokens, { doctorClerkId });
    if (!tokens) {
      throw new Error("Google Calendar not connected");
    }

    const { decryptToken, encryptToken } = await import("./lib/encryption.js");
    let accessToken = await decryptToken(tokens.encryptedAccessToken);
    const refreshToken = tokens.encryptedRefreshToken ? await decryptToken(tokens.encryptedRefreshToken) : null;
    
    // Check if expired and refresh
    if (Date.now() > tokens.tokenExpiry - 60000) { // 1 min buffer
      if (!refreshToken) throw new Error("Token expired and no refresh token available");
      accessToken = await refreshAccessToken(ctx, doctorClerkId, refreshToken, encryptToken);
    }

    // Fetch events from Google
    // We fetch primary calendar events for the last 3 months and next 6 months to avoid huge payloads
    const timeMin = new Date();
    timeMin.setMonth(timeMin.getMonth() - 3);
    const timeMax = new Date();
    timeMax.setMonth(timeMax.getMonth() + 6);

    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: "true",
      showDeleted: "true",
      orderBy: "startTime",
      maxResults: "2500"
    });

    let response = await fetch(`${URL_GOOGLE_CALENDAR_EVENTS}?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      // Token might be revoked or expired unexpectedly
      if (!refreshToken) throw new Error("Unauthorized and no refresh token");
      accessToken = await refreshAccessToken(ctx, doctorClerkId, refreshToken, encryptToken);
      response = await fetch(`${URL_GOOGLE_CALENDAR_EVENTS}?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch events after refresh");
    } else if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const data = await response.json();
    const items = data.items || [];

    const { normalizeGoogleEvent } = await import("./lib/googleApiParser.js");
    const localEvents = items.map((item: any) => normalizeGoogleEvent(item, doctorClerkId));

    // Chunk the upserts if there are too many events (Convex mutation limits)
    const chunkSize = 100;
    for (let i = 0; i < localEvents.length; i += chunkSize) {
      const chunk = localEvents.slice(i, i + chunkSize);
      await ctx.runMutation(api.googleCalendarEvents.upsertGoogleEvents, { events: chunk });
    }

    return { success: true, count: localEvents.length };
  },
});

async function refreshAccessToken(ctx: any, doctorClerkId: string, refreshToken: string, encryptFn: any) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing credentials for refresh");
  }

  const response = await fetch(URL_GOOGLE_CALENDAR_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    // If refresh token is revoked, we should probably delete the token record
    await ctx.runMutation(api.googleCalendarTokens.deleteTokens, {});
    throw new Error("Failed to refresh token (might be revoked)");
  }

  const data = await response.json();
  const newAccessToken = data.access_token;
  const newExpiry = Date.now() + (data.expires_in * 1000);
  
  const encryptedAccessToken = await encryptFn(newAccessToken);
  // Re-encrypt the existing refresh token because saveTokens needs it
  const encryptedRefreshToken = await encryptFn(refreshToken);

  await ctx.runMutation(api.googleCalendarTokens.saveTokens, {
    encryptedAccessToken,
    encryptedRefreshToken,
    tokenExpiry: newExpiry,
  });

  return newAccessToken;
}

async function getValidAccessToken(ctx: any, doctorClerkId: string) {
  const tokens = await ctx.runQuery(internal.googleCalendarTokens.getTokens, { doctorClerkId });
  if (!tokens) {
    return null;
  }

  const { decryptToken, encryptToken } = await import("./lib/encryption.js");
  let accessToken = await decryptToken(tokens.encryptedAccessToken);
  const refreshToken = tokens.encryptedRefreshToken ? await decryptToken(tokens.encryptedRefreshToken) : null;
  
  if (Date.now() > tokens.tokenExpiry - 60000) {
    if (!refreshToken) throw new Error("Token expired and no refresh token available");
    accessToken = await refreshAccessToken(ctx, doctorClerkId, refreshToken, encryptToken);
  }
  
  return accessToken;
}

export const createEvent = action({
  args: {
    appointmentId: v.id("appointments"),
    title: v.string(),
    description: v.optional(v.string()),
    start: v.number(),
    end: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const doctorClerkId = identity.subject;

    const accessToken = await getValidAccessToken(ctx, doctorClerkId);
    if (!accessToken) return { success: false, reason: "No token" };

    const eventData = {
      summary: args.title,
      description: args.description,
      start: { dateTime: new Date(args.start).toISOString() },
      end: { dateTime: new Date(args.end).toISOString() },
    };

    const response = await fetch(`${URL_GOOGLE_CALENDAR_EVENTS}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      console.error("Failed to create Google Calendar event", await response.text());
      return { success: false, reason: "API Error" };
    }

    const data = await response.json();
    
    await ctx.runMutation(api.appointments.update, {
      appointmentId: args.appointmentId,
      googleEventId: data.id,
    });
    
    return { success: true, googleEventId: data.id };
  }
});

export const updateEvent = action({
  args: {
    googleEventId: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    start: v.optional(v.number()),
    end: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const doctorClerkId = identity.subject;

    const accessToken = await getValidAccessToken(ctx, doctorClerkId);
    if (!accessToken) return { success: false, reason: "No token" };

    const eventData: any = {};
    if (args.title !== undefined) eventData.summary = args.title;
    if (args.description !== undefined) eventData.description = args.description;
    if (args.start !== undefined) eventData.start = { dateTime: new Date(args.start).toISOString() };
    if (args.end !== undefined) eventData.end = { dateTime: new Date(args.end).toISOString() };

    const response = await fetch(`${URL_GOOGLE_CALENDAR_EVENTS}/${args.googleEventId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      console.error("Failed to update Google Calendar event", await response.text());
      return { success: false, reason: "API Error" };
    }

    return { success: true };
  }
});

export const deleteEvent = action({
  args: {
    googleEventId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const doctorClerkId = identity.subject;

    const accessToken = await getValidAccessToken(ctx, doctorClerkId);
    if (!accessToken) return { success: false, reason: "No token" };

    const response = await fetch(`${URL_GOOGLE_CALENDAR_EVENTS}/${args.googleEventId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok && response.status !== 410) {
      console.error("Failed to delete Google Calendar event", await response.text());
      return { success: false, reason: "API Error" };
    }

    return { success: true };
  }
});
