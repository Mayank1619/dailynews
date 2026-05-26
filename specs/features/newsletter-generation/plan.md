# Implementation Plan: Newsletter Generation (HTML/Text)

**Branch**: $(System.Collections.Hashtable.branch) | **Date**: 2026-05-26 | **Spec**: /specs/features/newsletter-generation/spec.md

**Input**: Feature specification from /specs/features/newsletter-generation/spec.md

## Summary

Assemble per-user daily newsletter artifacts with attributed stories, AI summary labels, and unsubscribe controls.

No direct end-user identity enforcement is required in this feature; upstream authenticated inputs are trusted only through service boundaries and audit checks.

Scope statement: Phase 1 implementation included according to the feature scope and dependencies in spec.md.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22

**Primary Dependencies**: Next.js 15 (App Router), Node.js 22, TypeScript 5, Cloud Functions for Firebase, Cloud Firestore, Firebase Admin SDK

**Storage**: Cloud Firestore (collections aligned to feature entities)

**Testing**: Vitest for unit tests, Firebase emulators for integration tests, Playwright for end-to-end coverage

**Target Platform**: Web app + Firebase backend services

**Project Type**: Full-stack web application

**Performance Goals**: Generate newsletter records for daily active users before send window starts.

**Constraints**: No generation for opted-out users; attribution and AI labels always present.

**Scale/Scope**: 50k newsletters/day.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Fast value gate: PASS - Per-user digest composition, HTML/text rendering, idempotent generation, and status transitions.
- Trust gate: PASS - attribution and neutral framing are preserved in outputs and logs.
- Privacy and consent gate: PASS - explicit data minimization, consent controls, RBAC, and auditable events are included.
- Design system gate: PASS - UI and content surfaces align to design-system standards and accessibility constraints.
- Verification gate: PASS - unit, integration, and Playwright checks are included in this plan.

## Project Structure

### Documentation (this feature)

`	ext
specs/features/newsletter-generation/
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
|   |   -- features/newsletter-generation/
|   -- tests/
|-- api/
|   |-- src/
|   |   |-- functions/
|   |   |-- services/
|   |   -- features/newsletter-generation/
|   -- tests/
-- worker/
    |-- src/
    |   -- features/newsletter-generation/
    -- tests/
`

**Structure Decision**: Use the web + api + worker structure so feature logic can be independently tested, deployed, and audited while preserving shared design and auth foundations.

## Complexity Tracking

No constitution violations accepted for this feature plan.
