# Walkthrough — Feature Flags System

## What Was Built

A scalable, 3-layer feature gating system for Zenticare SaaS.

## Files Created

### Backend (Convex)

| File | Purpose |
|---|---|
| [plans.ts](file:///Users/carlos/Desktop/SaaS-Project/zenticare-saas/packages/database/convex/plans.ts) | **Source of truth** — defines `FeatureKey` types, `PLAN_CONFIGS` map, and helpers (`hasFeature`, `getPlanConfig`, `getFeatureLimit`) |
| [featureAccess.ts](file:///Users/carlos/Desktop/SaaS-Project/zenticare-saas/packages/database/convex/lib/featureAccess.ts) | **Backend guards** — `requireFeature()`, `requireChatMessageLimit()`, `getCurrentPlanKey()` |

### Frontend (Doctors App)

| File | Purpose |
|---|---|
| [useFeatureAccess.ts](file:///Users/carlos/Desktop/SaaS-Project/zenticare-saas/apps/doctors/hooks/useFeatureAccess.ts) | Reactive hook — subscribes to `getCurrentUser` for real-time plan data |
| [FeatureGate.tsx](file:///Users/carlos/Desktop/SaaS-Project/zenticare-saas/apps/doctors/components/shared/FeatureGate.tsx) | UI wrapper — shows/locks content based on feature access |
| [UpgradeOverlay.tsx](file:///Users/carlos/Desktop/SaaS-Project/zenticare-saas/apps/doctors/components/shared/UpgradeOverlay.tsx) | Glassmorphic "Upgrade to Pro" overlay for locked features |
| [FeaturesPanelCard.tsx](file:///Users/carlos/Desktop/SaaS-Project/zenticare-saas/apps/doctors/components/shared/FeaturesPanelCard.tsx) | Dashboard card showing active/locked features + message usage bar |

## Files Modified

| File | Change |
|---|---|
| [schema.ts](file:///Users/carlos/Desktop/SaaS-Project/zenticare-saas/packages/database/convex/schema.ts) | Added `messageCount: v.optional(v.number())` to `users` table |
| [users.ts](file:///Users/carlos/Desktop/SaaS-Project/zenticare-saas/packages/database/convex/users.ts) | Added `getCurrentUser` public query; imported `query` |
| [en.json](file:///Users/carlos/Desktop/SaaS-Project/zenticare-saas/apps/doctors/dictionaries/en.json) | Added `features` i18n section |
| [es.json](file:///Users/carlos/Desktop/SaaS-Project/zenticare-saas/apps/doctors/dictionaries/es.json) | Added `features` i18n section |
| [fr.json](file:///Users/carlos/Desktop/SaaS-Project/zenticare-saas/apps/doctors/dictionaries/fr.json) | Added `features` i18n section |
| [pt.json](file:///Users/carlos/Desktop/SaaS-Project/zenticare-saas/apps/doctors/dictionaries/pt.json) | Added `features` i18n section |

## How to Use

### Protect a Backend Mutation

```ts
import { requireFeature } from "./lib/featureAccess";

export const scheduleReminder = mutation({
  args: { ... },
  handler: async (ctx, args) => {
    await requireFeature(ctx, "scheduled_reminders"); // throws if not Pro
    // ... rest of logic
  },
});
```

### Gate a UI Component

```tsx
<FeatureGate feature="scheduled_reminders" lang={lang} dict={dict}>
  <ReminderSchedulerButton />
</FeatureGate>
```

### Show the Features Panel on the Dashboard

```tsx
<FeaturesPanelCard dict={dict} lang={lang} />
```

### Add a New Feature (Future)

1. Add the key to `FeatureKey` type in `plans.ts`
2. Add it to `PlanFeatures` interface
3. Set it in each plan's `features` object in `PLAN_CONFIGS`
4. Use `requireFeature(ctx, "new_feature")` in backend
5. Use `<FeatureGate feature="new_feature">` in frontend

## Verification

- ✅ `npx convex dev` — schema deployed successfully
- ✅ `npm run dev` — Next.js compiled without errors
