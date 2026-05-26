# Implementation Plan: Email Delivery + Scheduling

**Branch**: $(System.Collections.Hashtable.branch) | **Date**: 2026-05-26 | **Spec**: /specs/features/email-delivery/spec.md

**Input**: Feature specification from /specs/features/email-delivery/spec.md

## Summary

Deliver generated newsletters on user schedule with eligibility checks, retries, idempotency, and operational logging.

Identity, session, and authorization checks use Firebase Auth as the mandatory baseline (ID token verification, user UID ownership checks, and claims-based roles where applicable).

Scope statement: Phase 1 implementation included according to the feature scope and dependencies in spec.md.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22

**Primary Dependencies**: Next.js 15 (App Router), Node.js 22, TypeScript 5, Cloud Functions for Firebase, Cloud Firestore, Firebase Admin SDK, Firebase Auth (client + admin verification)

**Storage**: Cloud Firestore (collections aligned to feature entities)

**Testing**: Vitest for unit tests, Firebase emulators for integration tests, Playwright for end-to-end coverage

**Target Platform**: Web app + Firebase backend services

**Project Type**: Full-stack web application

**Performance Goals**: Queue and execute daily sends within user-selected windows.

**Constraints**: Never email unsubscribed, unverified, or blocked users.

**Scale/Scope**: 50k daily recipients with retry-safe pipeline.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Fast value gate: PASS - Pre-flight eligibility, delivery scheduling, send retries, unsubscribe enforcement, and alerts.
- Trust gate: PASS - attribution and neutral framing are preserved in outputs and logs.
- Privacy and consent gate: PASS - explicit data minimization, consent controls, RBAC, and auditable events are included.
- Design system gate: PASS - UI and content surfaces align to design-system standards and accessibility constraints.
- Verification gate: PASS - unit, integration, and Playwright checks are included in this plan.

## Project Structure

### Documentation (this feature)

`	ext
specs/features/email-delivery/
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
|   |   -- features/email-delivery/
|   -- tests/
|-- api/
|   |-- src/
|   |   |-- functions/
|   |   |-- services/
|   |   -- features/email-delivery/
|   -- tests/
-- worker/
    |-- src/
    |   -- features/email-delivery/
    -- tests/
`

**Structure Decision**: Use the web + api + worker structure so feature logic can be independently tested, deployed, and audited while preserving shared design and auth foundations.

## Complexity Tracking

No constitution violations accepted for this feature plan.
