import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const handleWebhook = internalMutation({
  args: {
    eventType: v.string(),
    data: v.string(), // JSON string due to dynamic payload
    occurredAt: v.optional(v.string()), // Top-level event time from paddle
  },
  handler: async (ctx, args) => {
    const data = JSON.parse(args.data);
    
    // Most paddle subscription events contain customer_id and subscription_id
    // They are usually structured inside data object depending on eventType
    
    console.log("Handling paddle event", args.eventType, "occurredAt:", args.occurredAt);

    if (args.eventType.startsWith("customer.")) {
        // Handle customer lifecycle if needed
    } else if (args.eventType.startsWith("subscription.")) {
        const customerId = data.customerId || data.customer_id;
        const subscriptionId = data.id;
        const status = data.status; // 'active', 'canceled', 'past_due', etc.

        if (!customerId) return null;

        // Find the user by paddleCustomerId
        // Or if paddleCustomerId isn't set yet, but customData exists:
        // By default we should ensure user maps their clerkId via customData in paddle
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
                planKey = "pro"; // A mapping table can be used here in the future to map price.id to 'pro', 'max', etc.
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
        // You might use this initially if subscription.created doesn't have custom data
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
                      // if just one-time, update a flag here
                  });
              }
        }
    }
  },
});
