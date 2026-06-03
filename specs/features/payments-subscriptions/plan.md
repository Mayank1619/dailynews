# Implementation Plan: Payments / Subscriptions

**Date**: 2026-06-02

## Summary

Activate a lightweight subscription model with a 15-day free trial and provider-ready checkout.

## Phase 1 - Implemented

- Add subscription types for trialing, active, expired, past_due, and canceled states.
- Add Daily Paper Plus plans:
  - $4.99/month
  - $49/year
- Add trial status and billing interval selection UI at `/billing`.
- Add settings dashboard billing summary.
- Keep checkout provider-ready; do not collect card details in app.

## Phase 2 - Next Backend Work

- Add Firebase-backed `user_subscriptions` records.
- Add authenticated `GET /api/subscriptions/current-user`.
- Add authenticated `POST /api/subscriptions/checkout`.
- Add Stripe or selected provider webhook with signature verification.
- Gate newsletter delivery on entitlement status.
- Add admin subscription metrics and trial conversion reporting.

## Provider Recommendation

Stripe is the recommended first provider because it supports subscriptions, hosted checkout, payment links, webhooks, tax tooling, and broad SaaS operational patterns.

## Risks

- Payment provider keys are not configured yet.
- Subscription state is currently local/demo state until Firestore-backed records are added.
- Trial-to-paid enforcement must be added to the newsletter delivery worker before production monetization.
