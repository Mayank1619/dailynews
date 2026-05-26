# Tasks: Content Processing (Dedup + Categorize)

**Input**: Design documents from /specs/features/content-processing/

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED by constitution and must be authored before implementation tasks in each user story phase.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Confirm feature scope and dependencies in specs/features/content-processing/spec.md
- [ ] T002 Capture implementation assumptions in specs/features/content-processing/plan.md
- [ ] T003 [P] Prepare feature test folders in tests/unit/content-processing/, tests/integration/content-processing/, and tests/e2e/content-processing/

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 [P] Create processing pipeline contracts in apps/worker/src/features/content-processing/contracts.ts
- [ ] T005 Implement canonical hash/version utility in apps/worker/src/features/content-processing/versioning.ts
- [ ] T006 [P] Set up processing telemetry and quality counters in apps/worker/src/features/content-processing/telemetry.ts

## Phase 3: User Story 1 - Deduplicate Stories Across Sources (Priority: P1)

**Goal**: Merge duplicate stories into canonical records.
**Independent Test**: Process duplicate corpus and verify single canonical story per event.

### Tests for US1 (write first and confirm failing baseline)

- [ ] T007 [P] [US1] Add contract/integration boundary test in tests/integration/content-processing/test-deduplicate-stories-across-sources-contracts.spec.ts
- [ ] T008 [P] [US1] Add unit test coverage in tests/unit/content-processing/test-deduplicate-stories-across-sources.spec.ts
- [ ] T009 [P] [US1] Add end-to-end scenario in tests/e2e/content-processing/test-deduplicate-stories-across-sources.e2e.ts

### Implementation for US1

- [ ] T010 [P] [US1] Create feature model/types in apps/api/src/features/content-processing/deduplicate-stories-across-sources.types.ts
- [ ] T011 [US1] Implement service logic in apps/api/src/features/content-processing/deduplicate-stories-across-sources.service.ts
- [ ] T012 [US1] Implement UI or endpoint integration in apps/web/src/features/content-processing/deduplicate-stories-across-sources.tsx
- [ ] T013 [US1] Add telemetry/audit hooks in apps/api/src/features/content-processing/deduplicate-stories-across-sources.telemetry.ts

## Phase 4: User Story 2 - Assign Taxonomy Categories to Stories (Priority: P1)

**Goal**: Attach taxonomy categories to processed stories.
**Independent Test**: Process uncategorized stories and verify valid category assignments.

### Tests for US2 (write first and confirm failing baseline)

- [ ] T014 [P] [US2] Add contract/integration boundary test in tests/integration/content-processing/test-assign-taxonomy-categories-to-stories-contracts.spec.ts
- [ ] T015 [P] [US2] Add unit test coverage in tests/unit/content-processing/test-assign-taxonomy-categories-to-stories.spec.ts
- [ ] T016 [P] [US2] Add end-to-end scenario in tests/e2e/content-processing/test-assign-taxonomy-categories-to-stories.e2e.ts

### Implementation for US2

- [ ] T017 [P] [US2] Create feature model/types in apps/api/src/features/content-processing/assign-taxonomy-categories-to-stories.types.ts
- [ ] T018 [US2] Implement service logic in apps/api/src/features/content-processing/assign-taxonomy-categories-to-stories.service.ts
- [ ] T019 [US2] Implement UI or endpoint integration in apps/web/src/features/content-processing/assign-taxonomy-categories-to-stories.tsx
- [ ] T020 [US2] Add telemetry/audit hooks in apps/api/src/features/content-processing/assign-taxonomy-categories-to-stories.telemetry.ts

## Phase 5: User Story 3 - Normalize Article Fields (Priority: P1)

**Goal**: Normalize article titles, excerpts, timestamps, and URLs.
**Independent Test**: Run normalization tests and verify canonical output format is enforced.

### Tests for US3 (write first and confirm failing baseline)

- [ ] T021 [P] [US3] Add contract/integration boundary test in tests/integration/content-processing/test-normalize-article-fields-contracts.spec.ts
- [ ] T022 [P] [US3] Add unit test coverage in tests/unit/content-processing/test-normalize-article-fields.spec.ts
- [ ] T023 [P] [US3] Add end-to-end scenario in tests/e2e/content-processing/test-normalize-article-fields.e2e.ts

### Implementation for US3

- [ ] T024 [P] [US3] Create feature model/types in apps/api/src/features/content-processing/normalize-article-fields.types.ts
- [ ] T025 [US3] Implement service logic in apps/api/src/features/content-processing/normalize-article-fields.service.ts
- [ ] T026 [US3] Implement UI or endpoint integration in apps/web/src/features/content-processing/normalize-article-fields.tsx
- [ ] T027 [US3] Add telemetry/audit hooks in apps/api/src/features/content-processing/normalize-article-fields.telemetry.ts

## Phase 6: User Story 4 - Preserve Full Source Attribution (Priority: P1)

**Goal**: Keep source attribution through processing transforms.
**Independent Test**: Trace attribution fields from raw to processed records and verify retention.

### Tests for US4 (write first and confirm failing baseline)

- [ ] T028 [P] [US4] Add contract/integration boundary test in tests/integration/content-processing/test-preserve-full-source-attribution-contracts.spec.ts
- [ ] T029 [P] [US4] Add unit test coverage in tests/unit/content-processing/test-preserve-full-source-attribution.spec.ts
- [ ] T030 [P] [US4] Add end-to-end scenario in tests/e2e/content-processing/test-preserve-full-source-attribution.e2e.ts

### Implementation for US4

- [ ] T031 [P] [US4] Create feature model/types in apps/api/src/features/content-processing/preserve-full-source-attribution.types.ts
- [ ] T032 [US4] Implement service logic in apps/api/src/features/content-processing/preserve-full-source-attribution.service.ts
- [ ] T033 [US4] Implement UI or endpoint integration in apps/web/src/features/content-processing/preserve-full-source-attribution.tsx
- [ ] T034 [US4] Add telemetry/audit hooks in apps/api/src/features/content-processing/preserve-full-source-attribution.telemetry.ts

## Phase 7: User Story 5 - Idempotent and Pipeline-Version-Tracked Processing (Priority: P2)

**Goal**: Guarantee idempotent processing and pipeline version tracking.
**Independent Test**: Re-run same batch and verify idempotent outcomes with version markers.

### Tests for US5 (write first and confirm failing baseline)

- [ ] T035 [P] [US5] Add contract/integration boundary test in tests/integration/content-processing/test-idempotent-and-pipeline-version-tracked-processing-contracts.spec.ts
- [ ] T036 [P] [US5] Add unit test coverage in tests/unit/content-processing/test-idempotent-and-pipeline-version-tracked-processing.spec.ts
- [ ] T037 [P] [US5] Add end-to-end scenario in tests/e2e/content-processing/test-idempotent-and-pipeline-version-tracked-processing.e2e.ts

### Implementation for US5

- [ ] T038 [P] [US5] Create feature model/types in apps/api/src/features/content-processing/idempotent-and-pipeline-version-tracked-processing.types.ts
- [ ] T039 [US5] Implement service logic in apps/api/src/features/content-processing/idempotent-and-pipeline-version-tracked-processing.service.ts
- [ ] T040 [US5] Implement UI or endpoint integration in apps/web/src/features/content-processing/idempotent-and-pipeline-version-tracked-processing.tsx
- [ ] T041 [US5] Add telemetry/audit hooks in apps/api/src/features/content-processing/idempotent-and-pipeline-version-tracked-processing.telemetry.ts

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T042 [P] Update feature documentation and runbook notes in specs/features/content-processing/quickstart.md
- [ ] T043 Run full test suite for this feature and capture results in specs/features/content-processing/quickstart.md
- [ ] T044 Verify privacy-safe telemetry and consent/RBAC compliance for this feature in specs/features/content-processing/spec.md

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