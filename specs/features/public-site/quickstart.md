# Quickstart - Public Site + Landing

## Goal
Validate the Phase 1 implementation slice for public-site.

## Prerequisites
- Node.js 22 and pnpm/npm installed
- Firebase project + emulators configured
- Confirm upstream services provide required authenticated artifacts and trusted service identity context.

## Steps
1. Load fixtures relevant to public-site from local emulator data.
2. Run feature unit tests.
3. Run integration tests against Firebase emulator suite.
4. Run Playwright scenario covering primary acceptance flow.
5. Inspect audit/telemetry logs for privacy-safe events only.

## Verification
- Core acceptance scenario passes for public-site.
- Constitution gates remain satisfied (trust, privacy/consent, design, verification).
- No sensitive data appears in logs.
