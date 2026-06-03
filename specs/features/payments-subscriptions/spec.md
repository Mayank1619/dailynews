# Feature Specification: Payments / Subscriptions

**Feature Branch**: `payments-subscriptions`

**Activated**: 2026-06-02

**Status**: Phase 2 Active

**Owner**: POD Platform

## Overview

Daily Paper uses a 15-day free trial followed by a paid subscription. Payment collection must be handled by an external payment provider such as Stripe; the application must never collect card data directly.

Launch pricing:

- Trial: 15 days free
- Monthly: $4.99/month
- Annual: $49/year

## User Stories

### User Story 1 - Start a Free Trial

As a new user, I want a 15-day free trial so I can test my personalized AI newsletter before paying.

Acceptance:

1. A signed-in user sees trial status and days remaining.
2. Trial starts automatically when billing state is first created.
3. Trial expiry is clearly shown without misleading language.

### User Story 2 - Choose a Paid Plan

As a trial user, I want to choose monthly or annual billing so I can continue after the trial.

Acceptance:

1. Billing screen shows monthly and annual options.
2. User can switch interval before checkout.
3. Checkout is routed to an external provider link once configured.

### User Story 3 - Enforce Entitlements

As the platform owner, I want newsletter delivery to respect trial/subscription state so expired users do not keep receiving paid newsletter output indefinitely.

Acceptance:

1. Trialing and active subscriptions are entitled.
2. Expired, canceled, or past-due subscriptions are not entitled.
3. Entitlement checks emit privacy-safe telemetry without card or invoice data.

### User Story 4 - Access Plus Reading Features

As a paying or trialing user, I want Plus to include more than email delivery so the subscription
feels valuable as my personal newspaper habit grows.

Acceptance:

1. Billing copy includes in-app paper reading as a plan feature.
2. Billing copy includes improvement controls for more depth and better context.
3. Future entitlement checks can gate premium refinement and saved-history depth without collecting
   payment data in the app.

## Requirements

- **FR-PS-001**: The system MUST provide a 15-day free trial for new users.
- **FR-PS-002**: The system MUST show subscription status, trial days remaining, and selected billing interval.
- **FR-PS-003**: The system MUST offer monthly and annual plans at launch: $4.99/month and $49/year.
- **FR-PS-004**: The system MUST redirect checkout to an external payment provider when configured.
- **FR-PS-005**: The system MUST avoid collecting or storing card numbers, CVV, or raw payment method details.
- **FR-PS-006**: The system MUST support provider-not-configured messaging so the app can be deployed before live Stripe setup.
- **FR-PS-007**: The system MUST expose subscription entitlement checks for newsletter generation/delivery.
- **FR-PS-008**: The system MUST record lifecycle telemetry for trial start, status view, checkout start, and entitlement checks.
- **FR-PS-009**: The Plus plan MUST describe in-app paper reading and improve-my-news refinement as included value.
- **FR-PS-010**: Premium curation/refinement features MUST be designed so entitlement checks can gate them when live payment provider integration is complete.

## Security and Privacy

- Payment data must stay with the external provider.
- Subscription telemetry must not contain card, invoice, or payment secret values.
- User-facing billing language must be clear and non-coercive.
- Checkout must require an authenticated user before a provider session is created.

## Pricing Rationale

The recommended $4.99/month price is based on:

- Low per-user AI generation cost when prompts use compact source summaries.
- Early email sending can fit inside Brevo's free 300-email/day tier.
- Payment processors include fixed transaction costs, so very low monthly prices lose margin.
- A $49/year plan improves cash flow and reduces monthly fixed payment-fee drag.

## Implementation Update (2026-06-02)

- Added trial/subscription state model with 15-day trial.
- Added `Daily Paper Plus` monthly and annual plan definitions.
- Added `/billing` route and dashboard billing link.
- Added provider-ready checkout messaging; live checkout waits for `STRIPE_PAYMENT_LINK_URL`.
- Updated marketing plan in `specs/marketing-ai-growth-plan.md`.
- Added in-app paper reading and improve-my-news refinement to Plus plan copy.
