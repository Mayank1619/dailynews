# Quickstart - User Dashboard + Newsletter History

## Goal
Validate the Phase 1 implementation slice for user-dashboard.

## Prerequisites
- Node.js 22 and pnpm/npm installed
- Firebase project + emulators configured
- Confirm Firebase Auth project is configured and ID token verification is enabled in API and worker paths.

## Steps
1. Load fixtures relevant to user-dashboard from local emulator data.
2. Run feature unit tests.
3. Run integration tests against Firebase emulator suite.
4. Run Playwright scenario covering primary acceptance flow.
5. Inspect audit/telemetry logs for privacy-safe events only.

## Verification
- Core acceptance scenario passes for user-dashboard.
- Constitution gates remain satisfied (trust, privacy/consent, design, verification).
- No sensitive data appears in logs.
