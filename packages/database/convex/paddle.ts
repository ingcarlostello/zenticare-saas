import { internalMutation, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const handleWebhook = internalMutation({
  args: {
    eventType: v.string(),
    data: v.string(), // JSON string due to dynamic payload
    occurredAt: v.optional(v.string()), // Top-level event time from paddle
  },
  handler: async (ctx, args) => {
    const data = JSON.parse(args.data);

    console.log("Handling paddle event", args.eventType, "occurredAt:", args.occurredAt);

    if (args.eventType.startsWith("customer.")) {
        // Handle customer lifecycle if needed
    } else if (args.eventType.startsWith("subscription.")) {
        const customerId = data.customerId || data.customer_id;
        const subscriptionId = data.id;
        const status = data.status; // 'active', 'canceled', 'past_due', etc.

        if (!customerId) return null;

        let user;

        const customData = data.customData || data.custom_data;

        if (customData && customData.clerkId) {
             user = await ctx.db
              .query("users")
              .withIndex("by_clerkId", (q) => q.eq("clerkId", customData.clerkId))
              .unique();
        } else {
             user = await ctx.db
              .query("users")
              .withIndex("by_paddleCustomerId", (q) => q.eq("paddleCustomerId", customerId))
              .unique();
        }

        if (user) {
            const subscriptionOccurredAt = args.occurredAt;

            if (user.subscriptionOccurredAt && subscriptionOccurredAt && new Date(subscriptionOccurredAt) < new Date(user.subscriptionOccurredAt)) {
                console.log("Ignoring outdated paddle webhook");
                return null;
            }

            let planKey = "free";
            if (status === "active" || status === "trialing" || status === "past_due") {
                planKey = "pro";
            }

            const firstItem = data?.items?.[0];

            await ctx.db.patch(user._id, {
                paddleCustomerId: customerId,
                paddleSubscriptionId: subscriptionId,
                subscriptionStatus: status,
                planKey,
                subscriptionPriceId: firstItem?.price?.id,
                subscriptionProductId: firstItem?.price?.productId || firstItem?.price?.product_id,
                subscriptionQuantity: firstItem?.quantity,
                collectionMode: data?.collectionMode || data?.collection_mode,
                nextBilledAt: data?.nextBilledAt || data?.next_billed_at,
                scheduledChange: data?.scheduledChange || data?.scheduled_change,
                canceledAt: data?.canceledAt || data?.canceled_at,
                pausedAt: data?.pausedAt || data?.paused_at,
                subscriptionOccurredAt: subscriptionOccurredAt || new Date().toISOString()
            });
            console.log(`Updated user ${user._id} subscription status to ${status} and plan to ${planKey}`);

            return { clerkId: user.clerkId, planKey };
        } else {
            console.error(`Could not find user to link subscription for customer ${customerId}. Ensure customData.clerkId was passed during checkout.`);
            return null;
        }
    } else if (args.eventType === "transaction.completed") {
        const customerId = data.customerId || data.customer_id;
        const subscriptionId = data.subscriptionId || data.subscription_id;
        const customData = data.customData || data.custom_data;

        if (customData && customData.clerkId) {
             const user = await ctx.db
              .query("users")
              .withIndex("by_clerkId", (q) => q.eq("clerkId", customData.clerkId))
              .unique();

              if (user && customerId) {
                  await ctx.db.patch(user._id, {
                      paddleCustomerId: customerId,
                      ...(subscriptionId ? { paddleSubscriptionId: subscriptionId } : {}),
                  });
              }
        }
    }
  },
});

export const createCustomerPortalSession = action({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getUserByClerkId, {
      clerkId: args.clerkId,
    });

    if (!user || !user.paddleCustomerId) {
      throw new Error("User not found or no paddle customer ID associated.");
    }

    const PADDLE_API_KEY = process.env.PADDLE_API_KEY;
    const PADDLE_ENVIRONMENT = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || "sandbox";

    if (!PADDLE_API_KEY) {
      throw new Error("PADDLE_API_KEY is not defined");
    }

    const apiUrl = PADDLE_ENVIRONMENT === "production"
      ? "https://api.paddle.com"
      : "https://sandbox-api.paddle.com";

    const response = await fetch(`${apiUrl}/customers/${user.paddleCustomerId}/portal-sessions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PADDLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Failed to create portal session:", response.status, text);
      throw new Error("Failed to create portal session on Paddle");
    }

    const json = await response.json();
    if (json?.data?.urls?.general?.overview) {
      return json.data.urls.general.overview as string;
    }

    throw new Error("No URL returned from Paddle");
  },
});
