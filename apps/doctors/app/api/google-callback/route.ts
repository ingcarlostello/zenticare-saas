import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  // TODO: we don't have lang in the URL easily available, fallback to /en for now
  // In a real scenario we could pass lang in the `state` parameter of OAuth.
  const redirectUrl = new URL("/en/dashboard/calendar/google-callback", req.url);

  if (error) {
    console.error("Google OAuth Error:", error);
    redirectUrl.searchParams.set("error", "oauth_failed");
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // Need to authenticate Convex client with Clerk token to perform the mutation!
    // Since we are in the server, it's easier to fetch Clerk token and pass it.
    // However, the action exchangeToken is an action. We can pass clerkId directly or use auth.
    // An alternative is passing the token in `Authorization` header.
    // But since this is a backend-to-backend call, maybe we can use `fetch` against the Http action, or just pass the clerkId as an argument if it's an internal mutation, but it's not internal.
    // Wait, the action `exchangeToken` will need to know who the user is.
    // To keep it simple, we can make `exchangeToken` an action that accepts `clerkId` as an argument if we can't easily pass the auth token, but that's insecure if called from client.
    // The most secure way: Use fetch to call Convex HTTP action, passing the Clerk JWT or call it from the frontend.
    
    // ACTUALLY, it's much better to let the FRONTEND do the mutation!
    // The API route just redirects to the frontend with the code!
    redirectUrl.searchParams.set("code", code);
    return NextResponse.redirect(redirectUrl);
    
  } catch (err) {
    console.error("Error exchanging token:", err);
    redirectUrl.searchParams.set("error", "exchange_failed");
    return NextResponse.redirect(redirectUrl);
  }
}
