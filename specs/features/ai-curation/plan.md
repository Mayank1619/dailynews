# Implementation Plan: AI Summarization + Ranking (Curation)

**Branch**: $(System.Collections.Hashtable.branch) | **Date**: 2026-05-26 | **Spec**: /specs/features/ai-curation/spec.md

**Input**: Feature specification from /specs/features/ai-curation/spec.md

## Summary

Generate attributed summaries and ranked story candidates from processed articles with deterministic fallbacks and cache reuse.

No direct end-user identity enforcement is required in this feature; upstream authenticated inputs are trusted only through service boundaries and audit checks.

Scope statement: Phase 1 implementation included according to the feature scope and dependencies in spec.md.

Implementation assumptions captured (T002):
- Ranking remains deterministic using topic-match priority followed by recency.
- Summary generation in this slice uses an injectable summarizer contract with fallback-first safety behavior.
- Privacy-safe telemetry captures aggregate counters and identifiers only; it excludes prompt/article body payloads.
- Category quotas are enforced via configurable `perCategoryLimit` validation (`> 0`).

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22

**Primary Dependencies**: Next.js 15 (App Router), Node.js 22, TypeScript 5, Cloud Functions for Firebase, Cloud Firestore, Firebase Admin SDK, LLM summarization gateway with cache

**Storage**: Cloud Firestore (collections aligned to feature entities)

**Testing**: Vitest for unit tests, Firebase emulators for integration tests, Playwright for end-to-end coverage

**Target Platform**: Web app + Firebase backend services

**Project Type**: Full-stack web application

**Performance Goals**: Process 1k processed articles in <20 minutes for daily window readiness.

**Constraints**: No fabricated claims; source attribution required for every summary.

**Scale/Scope**: Daily generation for 50k users with cache-first summarization.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Fast value gate: PASS - Summary generation, fallback behavior, per-user topic ranking, and model metadata persistence.
- Trust gate: PASS - attribution and neutral framing are preserved in outputs and logs.
- Privacy and consent gate: PASS - explicit data minimization, consent controls, RBAC, and auditable events are included.
- Design system gate: PASS - UI and content surfaces align to design-system standards and accessibility constraints.
- Verification gate: PASS - unit, integration, and Playwright checks are included in this plan.

## Project Structure

### Documentation (this feature)

`	ext
specs/features/ai-curation/
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
|   |   -- features/ai-curation/
|   -- tests/
|-- api/
|   |-- src/
|   |   |-- functions/
|   |   |-- services/
|   |   -- features/ai-curation/
|   -- tests/
-- worker/
    |-- src/
    |   -- features/ai-curation/
    -- tests/
`

**Structure Decision**: Use the web + api + worker structure so feature logic can be independently tested, deployed, and audited while preserving shared design and auth foundations.

## Complexity Tracking

No constitution violations accepted for this feature plan.
