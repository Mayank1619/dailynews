# Data Model - Payments Subscriptions

## Entities

- SubscriptionPlan: id, tier, name, billingInterval, priceCents, currency, trialDays, enabled
- UserSubscription: userId, planId, status, startedAt, trialEndsAt, currentPeriodEndsAt?, canceledAt?
- BillingEvent: id, userId, providerRef?, eventType, occurredAt

## Status Values

- trialing
- active
- past_due
- expired
- canceled

## Launch Plans

- `daily-paper-plus-monthly`: $4.99/month, 15-day trial
- `daily-paper-plus-annual`: $49/year, 15-day trial

## Relationships

- UserSubscription.userId -> Firebase Auth uid
- UserSubscription.planId -> SubscriptionPlan.id

## Validation

- Trial duration is 15 days.
- Trialing and active users are entitled to newsletter generation/delivery.
- Expired, past_due, and canceled users are not entitled to paid newsletter delivery.
- Card data is never stored in the application.
