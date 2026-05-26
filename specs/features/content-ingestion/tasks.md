# Tasks: Content Sources + Ingestion (RSS/API)

**Input**: Design documents from /specs/features/content-ingestion/

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED by constitution and must be authored before implementation tasks in each user story phase.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Confirm feature scope and dependencies in specs/features/content-ingestion/spec.md
- [ ] T002 Capture implementation assumptions in specs/features/content-ingestion/plan.md
- [ ] T003 [P] Prepare feature test folders in tests/unit/content-ingestion/, tests/integration/content-ingestion/, and tests/e2e/content-ingestion/

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 [P] Create ingestion connector interface and base types in apps/worker/src/features/content-ingestion/connectors.ts
- [ ] T005 Set up scheduler trigger and job orchestration in apps/worker/src/features/content-ingestion/scheduler.ts
- [ ] T006 [P] Implement ingestion observability and dead-letter routing in apps/worker/src/features/content-ingestion/telemetry.ts

## Phase 3: User Story 1 - Manage Approved Sources (Priority: P1)

**Goal**: Allow controlled creation and management of approved ingestion sources.
**Independent Test**: Create/update/disable source records and verify ingestion scheduler honors state.

### Tests for US1 (write first and confirm failing baseline)

- [ ] T007 [P] [US1] Add contract/integration boundary test in tests/integration/content-ingestion/test-manage-approved-sources-contracts.spec.ts
- [ ] T008 [P] [US1] Add unit test coverage in tests/unit/content-ingestion/test-manage-approved-sources.spec.ts
- [ ] T009 [P] [US1] Add end-to-end scenario in tests/e2e/content-ingestion/test-manage-approved-sources.e2e.ts

### Implementation for US1

- [ ] T010 [P] [US1] Create feature model/types in apps/api/src/features/content-ingestion/manage-approved-sources.types.ts
- [ ] T011 [US1] Implement service logic in apps/api/src/features/content-ingestion/manage-approved-sources.service.ts
- [ ] T012 [US1] Implement UI or endpoint integration in apps/web/src/features/content-ingestion/manage-approved-sources.tsx
- [ ] T013 [US1] Add telemetry/audit hooks in apps/api/src/features/content-ingestion/manage-approved-sources.telemetry.ts

## Phase 4: User Story 2 - Ingest Articles on Schedule (Priority: P1)

**Goal**: Collect articles from approved feeds and APIs on schedule.
**Independent Test**: Run scheduled ingestion job and verify expected article records are created.

### Tests for US2 (write first and confirm failing baseline)

- [ ] T014 [P] [US2] Add contract/integration boundary test in tests/integration/content-ingestion/test-ingest-articles-on-schedule-contracts.spec.ts
- [ ] T015 [P] [US2] Add unit test coverage in tests/unit/content-ingestion/test-ingest-articles-on-schedule.spec.ts
- [ ] T016 [P] [US2] Add end-to-end scenario in tests/e2e/content-ingestion/test-ingest-articles-on-schedule.e2e.ts

### Implementation for US2

- [ ] T017 [P] [US2] Create feature model/types in apps/api/src/features/content-ingestion/ingest-articles-on-schedule.types.ts
- [ ] T018 [US2] Implement service logic in apps/api/src/features/content-ingestion/ingest-articles-on-schedule.service.ts
- [ ] T019 [US2] Implement UI or endpoint integration in apps/web/src/features/content-ingestion/ingest-articles-on-schedule.tsx
- [ ] T020 [US2] Add telemetry/audit hooks in apps/api/src/features/content-ingestion/ingest-articles-on-schedule.telemetry.ts

## Phase 5: User Story 3 - Preserve Attribution and Avoid Duplicates (Priority: P2)

**Goal**: Keep source attribution and deduplicate repeated articles.
**Independent Test**: Ingest duplicate fixture and verify single canonical article remains with attribution.

### Tests for US3 (write first and confirm failing baseline)

- [ ] T021 [P] [US3] Add contract/integration boundary test in tests/integration/content-ingestion/test-preserve-attribution-and-avoid-duplicates-contracts.spec.ts
- [ ] T022 [P] [US3] Add unit test coverage in tests/unit/content-ingestion/test-preserve-attribution-and-avoid-duplicates.spec.ts
- [ ] T023 [P] [US3] Add end-to-end scenario in tests/e2e/content-ingestion/test-preserve-attribution-and-avoid-duplicates.e2e.ts

### Implementation for US3

- [ ] T024 [P] [US3] Create feature model/types in apps/api/src/features/content-ingestion/preserve-attribution-and-avoid-duplicates.types.ts
- [ ] T025 [US3] Implement service logic in apps/api/src/features/content-ingestion/preserve-attribution-and-avoid-duplicates.service.ts
- [ ] T026 [US3] Implement UI or endpoint integration in apps/web/src/features/content-ingestion/preserve-attribution-and-avoid-duplicates.tsx
- [ ] T027 [US3] Add telemetry/audit hooks in apps/api/src/features/content-ingestion/preserve-attribution-and-avoid-duplicates.telemetry.ts

## Phase 6: User Story 4 - Continue Through Partial Failures (Priority: P2)

**Goal**: Proceed with healthy sources when some providers fail.
**Independent Test**: Inject provider failure and verify remaining sources still ingest successfully.

### Tests for US4 (write first and confirm failing baseline)

- [ ] T028 [P] [US4] Add contract/integration boundary test in tests/integration/content-ingestion/test-continue-through-partial-failures-contracts.spec.ts
- [ ] T029 [P] [US4] Add unit test coverage in tests/unit/content-ingestion/test-continue-through-partial-failures.spec.ts
- [ ] T030 [P] [US4] Add end-to-end scenario in tests/e2e/content-ingestion/test-continue-through-partial-failures.e2e.ts

### Implementation for US4

- [ ] T031 [P] [US4] Create feature model/types in apps/api/src/features/content-ingestion/continue-through-partial-failures.types.ts
- [ ] T032 [US4] Implement service logic in apps/api/src/features/content-ingestion/continue-through-partial-failures.service.ts
- [ ] T033 [US4] Implement UI or endpoint integration in apps/web/src/features/content-ingestion/continue-through-partial-failures.tsx
- [ ] T034 [US4] Add telemetry/audit hooks in apps/api/src/features/content-ingestion/continue-through-partial-failures.telemetry.ts

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T035 [P] Update feature documentation and runbook notes in specs/features/content-ingestion/quickstart.md
- [ ] T036 Run full test suite for this feature and capture results in specs/features/content-ingestion/quickstart.md
- [ ] T037 Verify privacy-safe telemetry and consent/RBAC compliance for this feature in specs/features/content-ingestion/spec.md

## Dependencies & Execution Order

- Setup (Phase 1) must complete before Foundational (Phase 2).
- Foundational (Phase 2) blocks all user story phases.
- Within each user story: tests first, then models/types, then services, then integrations.
- Higher-priority stories (P1) should ship before P2/P3 unless parallel staffing is available.

## Parallel Opportunities

- Tasks marked [P] can run in parallel after their dependencies are complete.
- Test tasks within the same user story can run in parallel.
- Distinct user stories can run in parallel after Foundational phase completion.

## Implementation Strategy

- MVP: complete through the first P1 user story, validate independently, then ship.
- Incremental: add each next story while preserving independent testability.
- Validate quickstart scenarios after each completed story phase.