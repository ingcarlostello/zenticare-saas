import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { CLERK_API_BASE } from "./constants";


const http = httpRouter();

http.route({
  path: "/api/webhooks/clerk",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Missing CLERK_WEBHOOK_SECRET in environment variables");
      return new Response("Webhook secret not found", { status: 500 });
    }

    const svix_id = req.headers.get("svix-id");
    const svix_timestamp = req.headers.get("svix-timestamp");
    const svix_signature = req.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const payload = await req.text();
    const wh = new Webhook(webhookSecret);
    let evt: any;

    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Webhook Verification Failed", err);
      return new Response("Webhook Verification Failed", { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const email = email_addresses?.[0]?.email_address;
      const name = `${first_name ?? ""} ${last_name ?? ""}`.trim();

      await ctx.runMutation(internal.users.createUser, {
        clerkId: id,
        email: email ?? "",
        firstName: first_name ?? undefined,
        lastName: last_name ?? undefined,
        name: name || (email ?? "Unknown User"),
      });
    }

    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const email = email_addresses?.[0]?.email_address;
      const name = `${first_name ?? ""} ${last_name ?? ""}`.trim();

      await ctx.runMutation(internal.users.updateUser, {
        clerkId: id,
        email: email ?? "",
        firstName: first_name ?? undefined,
        lastName: last_name ?? undefined,
        name: name || (email ?? "Unknown User"),
      });
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;
      await ctx.runMutation(internal.users.deleteUser, { clerkId: id });
    }

    return new Response("Webhook processed successfully", { status: 200 });
  }),
});

http.route({
  path: "/api/webhooks/paddle",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const signature = req.headers.get("paddle-signature");
    if (!signature) {
      return new Response("Missing paddle-signature header", { status: 400 });
    }

    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
    const apiKey = process.env.PADDLE_API_KEY;

    if (!webhookSecret || !apiKey) {
      console.error("Missing paddle secrets");
      return new Response("Webhook secret not found", { status: 500 });
    }

    // El SDK de Paddle puede ser usado para desempaquetar y validar este webhook
    const paddle = new Paddle(apiKey, {
      environment: Environment.sandbox,
    });

    try {
      const payload = await req.text();
      const event = await paddle.webhooks.unmarshal(payload, webhookSecret, signature);

      // Enviamos el evento deserializado a la mutación interna que creamos.
      const result = await ctx.runMutation(internal.paddle.handleWebhook, {
        eventType: event.eventType,
        data: JSON.stringify(event.data),
        occurredAt: event.occurredAt ? new Date(event.occurredAt).toISOString() : undefined,
      });
      
      // Sincronizar planKey con Clerk public metadata usando su REST API
      if (result && result.clerkId && result.planKey) {
        const clerkSecret = process.env.CLERK_SECRET_KEY;
        if (clerkSecret) {
          try {
            await fetch(`${CLERK_API_BASE}/users/${result.clerkId}/metadata`, {
              method: "PATCH",
              headers: {
                "Authorization": `Bearer ${clerkSecret}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ public_metadata: { planKey: result.planKey } })
            });
            console.log(`Successfully synced planKey ${result.planKey} to Clerk user ${result.clerkId}`);
          } catch (syncError) {
            console.error("Failed to sync planKey to Clerk", syncError);
          }
        } else {
          console.warn("CLERK_SECRET_KEY no está configurado, saltando sincronización con Clerk metadata.");
        }
      }

      return new Response("Webhook processed successfully", { status: 200 });
    } catch (err) {
      console.error("Paddle Webhook Verification Failed", err);
      return new Response("Webhook Verification Failed", { status: 400 });
    }
  }),
});

export default http;
