# Contract - Payments Subscriptions

## GET /api/subscriptions/current-user

Returns the authenticated user's subscription state.

```json
{
  "userId": "<firebase-uid>",
  "planId": "daily-paper-plus-monthly",
  "status": "trialing",
  "startedAt": "2026-06-02T00:00:00.000Z",
  "trialEndsAt": "2026-06-17T00:00:00.000Z",
  "trialDaysRemaining": 15
}
```

## POST /api/subscriptions/checkout

Creates an external-provider checkout handoff.

Request:

```json
{
  "planId": "daily-paper-plus-monthly",
  "billingInterval": "monthly",
  "successUrl": "https://dailynews-theta-ten.vercel.app/billing?success=true",
  "cancelUrl": "https://dailynews-theta-ten.vercel.app/billing?canceled=true"
}
```

Response when provider is configured:

```json
{
  "checkoutUrl": "https://checkout.stripe.com/...",
  "providerConfigured": true
}
```

Response before provider setup:

```json
{
  "checkoutUrl": "/billing?checkout=provider-not-configured",
  "providerConfigured": false
}
```

## POST /api/subscriptions/webhook

Future provider webhook endpoint. Must validate provider signature before mutating subscription records.

## Entitlement Rule

`trialing` and `active` subscriptions are allowed. `expired`, `past_due`, and `canceled` subscriptions are blocked.
