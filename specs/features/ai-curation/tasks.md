# Tasks: AI Summarization + Ranking (Curation)

**Input**: Design documents from /specs/features/ai-curation/

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED by constitution and must be authored before implementation tasks in each user story phase.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Confirm feature scope and dependencies in specs/features/ai-curation/spec.md
- [ ] T002 Capture implementation assumptions in specs/features/ai-curation/plan.md
- [ ] T003 [P] Prepare feature test folders in tests/unit/ai-curation/, tests/integration/ai-curation/, and tests/e2e/ai-curation/

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 [P] Create curation pipeline interfaces in apps/worker/src/features/ai-curation/interfaces.ts
- [ ] T005 Configure model gateway and retry policy in apps/worker/src/features/ai-curation/modelGateway.ts
- [ ] T006 [P] Set up privacy-safe curation telemetry events in apps/worker/src/features/ai-curation/telemetry.ts

## Phase 3: User Story 1 - Receive a Ranked, Summarized Digest of Relevant Stories (Priority: P1)

**Goal**: Produce ranked summaries for relevant stories.
**Independent Test**: Run curation job fixture and verify ranked summarized output for user profile.

### Tests for US1 (write first and confirm failing baseline)

- [ ] T007 [P] [US1] Add contract/integration boundary test in tests/integration/ai-curation/test-receive-a-ranked-summarized-digest-of-relevant-stories-contracts.spec.ts
- [ ] T008 [P] [US1] Add unit test coverage in tests/unit/ai-curation/test-receive-a-ranked-summarized-digest-of-relevant-stories.spec.ts
- [ ] T009 [P] [US1] Add end-to-end scenario in tests/e2e/ai-curation/test-receive-a-ranked-summarized-digest-of-relevant-stories.e2e.ts

### Implementation for US1

- [ ] T010 [P] [US1] Create feature model/types in apps/api/src/features/ai-curation/receive-a-ranked-summarized-digest-of-relevant-stories.types.ts
- [ ] T011 [US1] Implement service logic in apps/api/src/features/ai-curation/receive-a-ranked-summarized-digest-of-relevant-stories.service.ts
- [ ] T012 [US1] Implement UI or endpoint integration in apps/web/src/features/ai-curation/receive-a-ranked-summarized-digest-of-relevant-stories.tsx
- [ ] T013 [US1] Add telemetry/audit hooks in apps/api/src/features/ai-curation/receive-a-ranked-summarized-digest-of-relevant-stories.telemetry.ts

## Phase 4: User Story 2 - Read Summaries That Are Honest About Their AI Origin (Priority: P1)

**Goal**: Label summaries clearly as AI-generated with attribution.
**Independent Test**: Inspect rendered digest and verify AI labels and source attribution are present.

### Tests for US2 (write first and confirm failing baseline)

- [ ] T014 [P] [US2] Add contract/integration boundary test in tests/integration/ai-curation/test-read-summaries-that-are-honest-about-their-ai-origin-contracts.spec.ts
- [ ] T015 [P] [US2] Add unit test coverage in tests/unit/ai-curation/test-read-summaries-that-are-honest-about-their-ai-origin.spec.ts
- [ ] T016 [P] [US2] Add end-to-end scenario in tests/e2e/ai-curation/test-read-summaries-that-are-honest-about-their-ai-origin.e2e.ts

### Implementation for US2

- [ ] T017 [P] [US2] Create feature model/types in apps/api/src/features/ai-curation/read-summaries-that-are-honest-about-their-ai-origin.types.ts
- [ ] T018 [US2] Implement service logic in apps/api/src/features/ai-curation/read-summaries-that-are-honest-about-their-ai-origin.service.ts
- [ ] T019 [US2] Implement UI or endpoint integration in apps/web/src/features/ai-curation/read-summaries-that-are-honest-about-their-ai-origin.tsx
- [ ] T020 [US2] Add telemetry/audit hooks in apps/api/src/features/ai-curation/read-summaries-that-are-honest-about-their-ai-origin.telemetry.ts

## Phase 5: User Story 3 - Receive a Readable Digest Even When AI Summarization Fails (Priority: P1)

**Goal**: Fall back to readable non-AI snippets when summarization fails.
**Independent Test**: Force summarizer failure and confirm fallback content is still delivered.

### Tests for US3 (write first and confirm failing baseline)

- [ ] T021 [P] [US3] Add contract/integration boundary test in tests/integration/ai-curation/test-receive-a-readable-digest-even-when-ai-summarization-fails-contracts.spec.ts
- [ ] T022 [P] [US3] Add unit test coverage in tests/unit/ai-curation/test-receive-a-readable-digest-even-when-ai-summarization-fails.spec.ts
- [ ] T023 [P] [US3] Add end-to-end scenario in tests/e2e/ai-curation/test-receive-a-readable-digest-even-when-ai-summarization-fails.e2e.ts

### Implementation for US3

- [ ] T024 [P] [US3] Create feature model/types in apps/api/src/features/ai-curation/receive-a-readable-digest-even-when-ai-summarization-fails.types.ts
- [ ] T025 [US3] Implement service logic in apps/api/src/features/ai-curation/receive-a-readable-digest-even-when-ai-summarization-fails.service.ts
- [ ] T026 [US3] Implement UI or endpoint integration in apps/web/src/features/ai-curation/receive-a-readable-digest-even-when-ai-summarization-fails.tsx
- [ ] T027 [US3] Add telemetry/audit hooks in apps/api/src/features/ai-curation/receive-a-readable-digest-even-when-ai-summarization-fails.telemetry.ts

## Phase 6: User Story 4 - Digest Includes a Controlled Number of Stories Per Category (Priority: P2)

**Goal**: Enforce category quotas in digest assembly.
**Independent Test**: Process mixed-category fixture and verify per-category limits are enforced.

### Tests for US4 (write first and confirm failing baseline)

- [ ] T028 [P] [US4] Add contract/integration boundary test in tests/integration/ai-curation/test-digest-includes-a-controlled-number-of-stories-per-category-contracts.spec.ts
- [ ] T029 [P] [US4] Add unit test coverage in tests/unit/ai-curation/test-digest-includes-a-controlled-number-of-stories-per-category.spec.ts
- [ ] T030 [P] [US4] Add end-to-end scenario in tests/e2e/ai-curation/test-digest-includes-a-controlled-number-of-stories-per-category.e2e.ts

### Implementation for US4

- [ ] T031 [P] [US4] Create feature model/types in apps/api/src/features/ai-curation/digest-includes-a-controlled-number-of-stories-per-category.types.ts
- [ ] T032 [US4] Implement service logic in apps/api/src/features/ai-curation/digest-includes-a-controlled-number-of-stories-per-category.service.ts
- [ ] T033 [US4] Implement UI or endpoint integration in apps/web/src/features/ai-curation/digest-includes-a-controlled-number-of-stories-per-category.tsx
- [ ] T034 [US4] Add telemetry/audit hooks in apps/api/src/features/ai-curation/digest-includes-a-controlled-number-of-stories-per-category.telemetry.ts

## Phase 7: User Story 5 - Summaries Are Served From Cache for Repeated Stories (Priority: P3)

**Goal**: Reuse cached summaries for repeated content.
**Independent Test**: Reprocess repeated article and verify cache hit path is used.

### Tests for US5 (write first and confirm failing baseline)

- [ ] T035 [P] [US5] Add contract/integration boundary test in tests/integration/ai-curation/test-summaries-are-served-from-cache-for-repeated-stories-contracts.spec.ts
- [ ] T036 [P] [US5] Add unit test coverage in tests/unit/ai-curation/test-summaries-are-served-from-cache-for-repeated-stories.spec.ts
- [ ] T037 [P] [US5] Add end-to-end scenario in tests/e2e/ai-curation/test-summaries-are-served-from-cache-for-repeated-stories.e2e.ts

### Implementation for US5

- [ ] T038 [P] [US5] Create feature model/types in apps/api/src/features/ai-curation/summaries-are-served-from-cache-for-repeated-stories.types.ts
- [ ] T039 [US5] Implement service logic in apps/api/src/features/ai-curation/summaries-are-served-from-cache-for-repeated-stories.service.ts
- [ ] T040 [US5] Implement UI or endpoint integration in apps/web/src/features/ai-curation/summaries-are-served-from-cache-for-repeated-stories.tsx
- [ ] T041 [US5] Add telemetry/audit hooks in apps/api/src/features/ai-curation/summaries-are-served-from-cache-for-repeated-stories.telemetry.ts

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T042 [P] Update feature documentation and runbook notes in specs/features/ai-curation/quickstart.md
- [ ] T043 Run full test suite for this feature and capture results in specs/features/ai-curation/quickstart.md
- [ ] T044 Verify privacy-safe telemetry and consent/RBAC compliance for this feature in specs/features/ai-curation/spec.md

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