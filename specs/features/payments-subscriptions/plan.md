# Implementation Plan: Payments / Subscriptions (Phase 2 Placeholder)

**Branch**: $(System.Collections.Hashtable.branch) | **Date**: 2026-05-26 | **Spec**: /specs/features/payments-subscriptions/spec.md

**Input**: Feature specification from /specs/features/payments-subscriptions/spec.md

## Summary

Reserve architecture and contracts for monetization while explicitly deferring implementation beyond Phase 1.

Identity, session, and authorization checks use Firebase Auth as the mandatory baseline (ID token verification, user UID ownership checks, and claims-based roles where applicable).

Scope statement: Phase 2 placeholder only. Phase 1 implementation is explicitly out of scope and blocked by constitution-aligned monetization deferral.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22

**Primary Dependencies**: Next.js 15 (App Router), Node.js 22, TypeScript 5, Cloud Functions for Firebase, Cloud Firestore, Firebase Admin SDK, Firebase Auth (client + admin verification), Stripe SDK (reserved for Phase 2 only)

**Storage**: Cloud Firestore (collections aligned to feature entities)

**Testing**: Vitest for unit tests, Firebase emulators for integration tests, Playwright for end-to-end coverage

**Target Platform**: Web app + Firebase backend services

**Project Type**: Full-stack web application

**Performance Goals**: N/A in Phase 1.

**Constraints**: No payment code, no billing workflows, no paid enforcement in Phase 1.

**Scale/Scope**: Future Phase 2 planning only.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Fast value gate: PASS - Documented placeholders only: reserved flags, migration notes, compliance guardrails, and activation criteria.
- Trust gate: PASS - attribution and neutral framing are preserved in outputs and logs.
- Privacy and consent gate: PASS - explicit data minimization, consent controls, RBAC, and auditable events are included.
- Design system gate: PASS - UI and content surfaces align to design-system standards and accessibility constraints.
- Verification gate: PASS - unit, integration, and Playwright checks are included in this plan.

## Project Structure

### Documentation (this feature)

`	ext
specs/features/payments-subscriptions/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
-- tasks.md
`

### Source Code (repository root)

`	ext
apps/
|-- web/
|   |-- src/
|   |   |-- app/
|   |   |-- components/
|   |   -- features/payments-subscriptions/
|   -- tests/
|-- api/
|   |-- src/
|   |   |-- functions/
|   |   |-- services/
|   |   -- features/payments-subscriptions/
|   -- tests/
-- worker/
    |-- src/
    |   -- features/payments-subscriptions/
    -- tests/
`

**Structure Decision**: Use the web + api + worker structure so feature logic can be independently tested, deployed, and audited while preserving shared design and auth foundations.

## Complexity Tracking

No constitution violations accepted for this feature plan.

## Phase 2 Activation Criteria

All of the following criteria MUST be satisfied before any Phase 2 monetization work begins:

1. **legalComplianceApproved**: Legal and compliance review of billing, tax, and consumer-protection requirements completed and approved.
2. **paymentProviderSelected**: External payment processor (e.g. Stripe) evaluated and selected per regional and business requirements.
3. **consentDesignApproved**: Explicit opt-in consent flow and reversible subscription controls designed and approved against constitution guardrails.
4. **migrationPlanDocumented**: A backward-compatible migration path from free-tier to optional paid plans documented and validated.
5. **constitutionGatesPassed**: All constitution gates (trust, privacy/consent, design, verification) re-evaluated against the Phase 2 feature spec.

## Implementation Assumptions (Phase 1)

- All users remain on the `free-plan` tier. No user-facing upgrade, checkout, or cancellation flows exist.
- Placeholder types (`SubscriptionPlanPlaceholder`, `UserSubscriptionPlaceholder`, `BillingEventPlaceholder`) are TypeScript-only definitions with no Firestore persistence in Phase 1.
- Telemetry is limited to governance signals: `phase1.scope_check_passed`, `phase1.scope_check_failed`, `phase1.free_tier_confirmed`, `phase1.reserved_endpoint_blocked`.
- Reserved Phase 2 API endpoints (`/api/subscriptions/checkout`, `/api/subscriptions/webhook`, `/api/subscriptions/status`) return scope-blocked responses via `ScopeProtectionService`.
- Premium feature flags (`ad-free`, `more-sources`, `longer-digest`) are type-reserved only and MUST NOT be toggled for any user in Phase 1.
- Frontend `PlanStatusDisplay` component presents free-tier status only; no purchase or upgrade path is rendered.
