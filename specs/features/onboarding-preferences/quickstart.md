# Quickstart - Onboarding + Preferences

## Goal
Validate the Phase 1 implementation slice for onboarding-preferences.

## Prerequisites
- Node.js 22 and pnpm/npm installed
- Firebase project + emulators configured
- Confirm Firebase Auth project is configured and ID token verification is enabled in API and worker paths.

## Steps
1. Load fixtures relevant to onboarding-preferences from local emulator data.
2. Run feature unit tests.
3. Run integration tests against Firebase emulator suite.
4. Run Playwright scenario covering primary acceptance flow.
5. Inspect audit/telemetry logs for privacy-safe events only.

## Verification
- Core acceptance scenario passes for onboarding-preferences.
- Constitution gates remain satisfied (trust, privacy/consent, design, verification).
- No sensitive data appears in logs.

## Local SPA Route Coverage
- `/onboarding` now provides the first-time topic, region, delivery time, and review flow.
- `/dashboard/preferences` persists editable preferences in browser storage for local development.
- `/dashboard/newsletter` pauses/resumes delivery while preserving saved preferences.
- Verified on 2026-06-02 with `npm run build`, `npm run test:unit`, `npm run test:integration`, and `npm run test:e2e`.
