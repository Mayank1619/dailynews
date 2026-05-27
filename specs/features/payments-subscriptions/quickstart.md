# Quickstart - Payments / Subscriptions (Phase 2 Placeholder)

## Goal
Validate the Phase 2 placeholder only for payments-subscriptions.

## Prerequisites
- Node.js 22 and pnpm/npm installed
- Firebase project + emulators configured
- Confirm Firebase Auth project is configured and ID token verification is enabled in API and worker paths.

## Steps
1. Load fixtures relevant to payments-subscriptions from local emulator data.
2. Run feature unit tests.
3. Run integration tests against Firebase emulator suite.
4. Run Playwright scenario covering primary acceptance flow.
5. Inspect audit/telemetry logs for privacy-safe events only.

## Verification
- Core acceptance scenario passes for payments-subscriptions.
- Constitution gates remain satisfied (trust, privacy/consent, design, verification).
- No sensitive data appears in logs.

## Non-Implementation Validation Checklist (Phase 1)

Run these checks to confirm Phase 1 scope compliance before any PR merge:

- [ ] `grep -r "checkout\|billing\|invoice\|stripe" apps/api/src/features/payments-subscriptions/` returns no hits beyond reserved type comments.
- [ ] `grep -r "checkout\|billing\|invoice\|stripe" apps/web/src/features/payments-subscriptions/` returns no hits.
- [ ] No Firestore write operations exist in `payments-subscriptions` feature files.
- [ ] All reserved Phase 2 endpoints return `{ allowed: false }` from `ScopeProtectionService`.
- [ ] Telemetry events contain only governance signal names (no `payment.*` or `billing.*` event names).
- [ ] `PlanStatusDisplay` component renders no checkout, upgrade, or subscription-purchase UI elements.
- [ ] Unit tests pass: `vitest run tests/unit/payments-subscriptions/`
- [ ] Integration tests pass: `vitest run tests/integration/payments-subscriptions/`
- [ ] E2E tests pass: `playwright test tests/e2e/payments-subscriptions/`

## Phase 2 Activation Runbook

When Phase 2 is approved by product, legal, and compliance stakeholders:

1. Update `Phase2ActivationCriteria` flags to `true` after each gate is satisfied.
2. Replace placeholder types with full Firestore-backed entities per `data-model.md`.
3. Implement `POST /api/subscriptions/checkout` with explicit user consent capture and Firebase Auth token verification.
4. Implement `POST /api/subscriptions/webhook` with payment provider signature validation.
5. Implement `GET /api/subscriptions/status` with Firebase Admin UID ownership checks.
6. Activate premium feature flags only after consent design review is approved.
7. Re-run all constitution gates before merging Phase 2 implementation.

## Test Results (Phase 1)

- Unit: `vitest run tests/unit/payments-subscriptions/` validates scope guard, telemetry, and free-tier subscription state.
- Integration: `vitest run tests/integration/payments-subscriptions/` validates reserved contract shapes and scope-guard responses.
- E2E: `playwright test tests/e2e/payments-subscriptions/` validates free-tier UI and confirms no paid flows are surfaced.
