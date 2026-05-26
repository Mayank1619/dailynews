# Quickstart - Design System

## Goal
Validate the Phase 1 implementation slice for design-system.

## Prerequisites
- Node.js 22 and pnpm/npm installed
- Firebase project + emulators configured
- Confirm upstream services provide required authenticated artifacts and trusted service identity context.

## Steps
1. Load fixtures relevant to design-system from local emulator data.
2. Run feature unit tests.
3. Run integration tests against Firebase emulator suite.
4. Run Playwright scenario covering primary acceptance flow.
5. Inspect audit/telemetry logs for privacy-safe events only.

## Verification
- Core acceptance scenario passes for design-system.
- Constitution gates remain satisfied (trust, privacy/consent, design, verification).
- No sensitive data appears in logs.
