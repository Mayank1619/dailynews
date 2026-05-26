# Implementation Plan: Authentication + Consent

**Branch**: $(System.Collections.Hashtable.branch) | **Date**: 2026-05-26 | **Spec**: /specs/features/authentication-consent/spec.md

**Input**: Feature specification from /specs/features/authentication-consent/spec.md

## Summary

Implement sign-up/sign-in session flow and explicit consent capture using Firebase Auth as identity baseline.

Identity, session, and authorization checks use Firebase Auth as the mandatory baseline (ID token verification, user UID ownership checks, and claims-based roles where applicable).

Scope statement: Phase 1 implementation included according to the feature scope and dependencies in spec.md.

## Implementation Assumptions (This Pass)

- Firebase credentials and client config variables are provided through deployment environment variables and are not hardcoded.
- Signup identity creation uses Firebase Auth email-password baseline, while consent persistence is handled by feature service abstractions in this slice.
- Consent telemetry and audit events must remain privacy-safe and exclude raw IP addresses, user agents, passwords, and secrets.
- This pass intentionally excludes US2 and US3 runtime flows beyond shared foundational auth middleware and audit infrastructure.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22

**Primary Dependencies**: Next.js 15 (App Router), Node.js 22, TypeScript 5, Cloud Functions for Firebase, Cloud Firestore, Firebase Admin SDK, Firebase Auth (client + admin verification)

**Storage**: Cloud Firestore (collections aligned to feature entities)

**Testing**: Vitest for unit tests, Firebase emulators for integration tests, Playwright for end-to-end coverage

**Target Platform**: Web app + Firebase backend services

**Project Type**: Full-stack web application

**Performance Goals**: Auth operations under 300ms p95 excluding provider latency.

**Constraints**: Consent must be explicit, auditable, reversible, and versioned.

**Scale/Scope**: 50k users with secure session and consent lookup support.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Fast value gate: PASS - Email/password auth, verification, reset, session lifecycle, and versioned consent records.
- Trust gate: PASS - attribution and neutral framing are preserved in outputs and logs.
- Privacy and consent gate: PASS - explicit data minimization, consent controls, RBAC, and auditable events are included.
- Design system gate: PASS - UI and content surfaces align to design-system standards and accessibility constraints.
- Verification gate: PASS - unit, integration, and Playwright checks are included in this plan.

## Project Structure

### Documentation (this feature)

`	ext
specs/features/authentication-consent/
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
|   |   -- features/authentication-consent/
|   -- tests/
|-- api/
|   |-- src/
|   |   |-- functions/
|   |   |-- services/
|   |   -- features/authentication-consent/
|   -- tests/
-- worker/
    |-- src/
    |   -- features/authentication-consent/
    -- tests/
`

**Structure Decision**: Use the web + api + worker structure so feature logic can be independently tested, deployed, and audited while preserving shared design and auth foundations.

## Complexity Tracking

No constitution violations accepted for this feature plan.
