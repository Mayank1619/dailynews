# Data Model - Payments Subscriptions (Phase 2 Placeholder)

## Entities (Reserved for Phase 2)
- SubscriptionPlan (reserved): id, tier, billingInterval, price, currency, enabled
- UserSubscription (reserved): userId, planId, status, startedAt, canceledAt?
- BillingEvent (reserved): id, userId, providerRef, eventType, occurredAt

## Relationships
- UserSubscription.userId -> Firebase Auth uid

## Validation
- No active persistence or business logic in Phase 1.
- Reserved schemas are documentation-only placeholders.
