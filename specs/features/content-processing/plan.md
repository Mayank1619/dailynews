# Implementation Plan: Content Processing (Dedup + Categorize)

**Branch**: $(System.Collections.Hashtable.branch) | **Date**: 2026-05-26 | **Spec**: /specs/features/content-processing/spec.md

**Input**: Feature specification from /specs/features/content-processing/spec.md

## Summary

Normalize, deduplicate, and categorize raw news content into processed records suitable for digest generation.

No direct end-user identity enforcement is required in this feature; upstream authenticated inputs are trusted only through service boundaries and audit checks.

Scope statement: Phase 1 implementation included according to the feature scope and dependencies in spec.md.

Implementation assumptions for the Phase 1 slice:
- Canonical URL normalization removes tracking query parameters and trailing slash variants before grouping.
- Title similarity deduplication is deterministic and uses a fixed threshold tuned for this corpus slice.
- `rawHash` is the fallback grouping key when a raw article has no URL.
- Source attribution always preserves the original source URL value from ingestion records.
- `scoreSignals` remains optional and is omitted when absent.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22

**Primary Dependencies**: Next.js 15 (App Router), Node.js 22, TypeScript 5, Cloud Functions for Firebase, Cloud Firestore, Firebase Admin SDK, Deterministic similarity scoring utilities

**Storage**: Cloud Firestore (collections aligned to feature entities)

**Testing**: Vitest for unit tests, Firebase emulators for integration tests, Playwright for end-to-end coverage

**Target Platform**: Web app + Firebase backend services

**Project Type**: Full-stack web application

**Performance Goals**: Process 1k raw articles inside 30-60 minute pipeline window.

**Constraints**: Deterministic grouping, idempotent outputs, and full source attribution.

**Scale/Scope**: Tens of thousands of processed records per day.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Fast value gate: PASS - Canonical URL + similarity dedup, taxonomy assignment, source list preservation, and reprocessing support.
- Trust gate: PASS - attribution and neutral framing are preserved in outputs and logs.
- Privacy and consent gate: PASS - explicit data minimization, consent controls, RBAC, and auditable events are included.
- Design system gate: PASS - UI and content surfaces align to design-system standards and accessibility constraints.
- Verification gate: PASS - unit, integration, and Playwright checks are included in this plan.

## Project Structure

### Documentation (this feature)

`	ext
specs/features/content-processing/
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
|   |   -- features/content-processing/
|   -- tests/
|-- api/
|   |-- src/
|   |   |-- functions/
|   |   |-- services/
|   |   -- features/content-processing/
|   -- tests/
-- worker/
    |-- src/
    |   -- features/content-processing/
    -- tests/
`

**Structure Decision**: Use the web + api + worker structure so feature logic can be independently tested, deployed, and audited while preserving shared design and auth foundations.

## Complexity Tracking

No constitution violations accepted for this feature plan.
