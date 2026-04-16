import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

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

export default http;
