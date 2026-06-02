# Quickstart - Email Delivery + Scheduling

## Goal
Validate the Phase 1 implementation slice for email-delivery.

## Prerequisites
- Node.js 22 and pnpm/npm installed
- Firebase project + emulators configured
- Confirm Firebase Auth project is configured and ID token verification is enabled in API and worker paths.

## Steps
1. Load fixtures relevant to email-delivery from local emulator data.
2. Run feature unit tests.
3. Run integration tests against Firebase emulator suite.
4. Run Playwright scenario covering primary acceptance flow.
5. Inspect audit/telemetry logs for privacy-safe events only.

## Verification
- Core acceptance scenario passes for email-delivery.
- Constitution gates remain satisfied (trust, privacy/consent, design, verification).
- No sensitive data appears in logs.

## Local SPA Route Coverage
- `/settings` links users to delivery-time preferences and subscription controls.
- `/dashboard/newsletter` supports unsubscribe/resubscribe behavior for local development.
- `/admin` renders aggregate delivery-health metrics without personal data.
- `/api/email/unsubscribe?token=...` has a Vercel serverless confirmation endpoint and a matching SPA fallback in local Vite.
- Verified on 2026-06-02 with `npm run build`, `npm run test:unit`, `npm run test:integration`, and `npm run test:e2e`.
