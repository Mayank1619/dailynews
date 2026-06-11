# Quickstart - Payments / Subscriptions

## Goal

Validate 15-day trial, plan selection, and provider-ready checkout behavior.

## Prerequisites

- Firebase Auth configured.
- Optional: `STRIPE_PAYMENT_LINK_URL` configured in Vercel for live checkout handoff.
- No card data is collected by the app.

## Steps

1. Sign in.
2. Open `/billing`.
3. Confirm 15-day trial status and days remaining.
4. Switch between monthly and annual billing.
5. Click "Continue with Plus".
6. If `STRIPE_PAYMENT_LINK_URL` is absent, confirm provider-not-configured messaging.
7. If provider URL is configured, confirm redirect goes to the external provider.

## Verification

- Unit tests pass: `vitest run tests/unit/payments-subscriptions/`
- Integration tests pass: `vitest run tests/integration/payments-subscriptions/`
- E2E tests pass: `playwright test tests/e2e/payments-subscriptions/`
- No app code stores card numbers, CVV, payment method tokens, or provider secrets.

## Test Results

- Pending latest run after 2026-06-02 activation.
