# Implementation Plan: Onboarding + Preferences

**Branch**: $(System.Collections.Hashtable.branch) | **Date**: 2026-05-26 | **Spec**: /specs/features/onboarding-preferences/spec.md

**Input**: Feature specification from /specs/features/onboarding-preferences/spec.md

## Summary

Capture and manage explicit personalization settings for topics, region, and delivery schedule under authenticated user context.

Identity, session, and authorization checks use Firebase Auth as the mandatory baseline (ID token verification, user UID ownership checks, and claims-based roles where applicable).

Scope statement: Phase 1 implementation included according to the feature scope and dependencies in spec.md.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22

**Primary Dependencies**: Next.js 15 (App Router), Node.js 22, TypeScript 5, Cloud Functions for Firebase, Cloud Firestore, Firebase Admin SDK, Firebase Auth (client + admin verification)

**Storage**: Cloud Firestore (collections aligned to feature entities)

**Testing**: Vitest for unit tests, Firebase emulators for integration tests, Playwright for end-to-end coverage

**Target Platform**: Web app + Firebase backend services

**Project Type**: Full-stack web application

**Performance Goals**: Preferences read/write under 200ms p95.

**Constraints**: At least one topic required; region defaults to Canada; authenticated ownership checks required.

**Scale/Scope**: 50k active user preference profiles.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Fast value gate: PASS - First-run onboarding flow, preferences API, update behavior, and pause/resume controls.
- Trust gate: PASS - attribution and neutral framing are preserved in outputs and logs.
- Privacy and consent gate: PASS - explicit data minimization, consent controls, RBAC, and auditable events are included.
- Design system gate: PASS - UI and content surfaces align to design-system standards and accessibility constraints.
- Verification gate: PASS - unit, integration, and Playwright checks are included in this plan.

## Project Structure

### Documentation (this feature)

`	ext
specs/features/onboarding-preferences/
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
|   |   -- features/onboarding-preferences/
|   -- tests/
|-- api/
|   |-- src/
|   |   |-- functions/
|   |   |-- services/
|   |   -- features/onboarding-preferences/
|   -- tests/
-- worker/
    |-- src/
    |   -- features/onboarding-preferences/
    -- tests/
`

**Structure Decision**: Use the web + api + worker structure so feature logic can be independently tested, deployed, and audited while preserving shared design and auth foundations.

## Complexity Tracking

No constitution violations accepted for this feature plan.
