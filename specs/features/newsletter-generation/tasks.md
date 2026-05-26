# Tasks: Newsletter Generation (HTML/Text)

**Input**: Design documents from /specs/features/newsletter-generation/

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED by constitution and must be authored before implementation tasks in each user story phase.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Confirm feature scope and dependencies in specs/features/newsletter-generation/spec.md
- [ ] T002 Capture implementation assumptions in specs/features/newsletter-generation/plan.md
- [ ] T003 [P] Prepare feature test folders in tests/unit/newsletter-generation/, tests/integration/newsletter-generation/, and tests/e2e/newsletter-generation/

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 [P] Create newsletter template contracts in apps/api/src/features/newsletter-generation/templateContracts.ts
- [ ] T005 Set up rendering pipeline and sanitizer utilities in apps/api/src/features/newsletter-generation/renderPipeline.ts
- [ ] T006 [P] Configure generation telemetry and attribution integrity checks in apps/api/src/features/newsletter-generation/telemetry.ts

## Phase 3: User Story 1 - Receive a Personalized Daily Paper in My Inbox (Priority: P1)

**Goal**: Generate personalized newsletter content per user preferences.
**Independent Test**: Generate newsletter from seeded preferences and verify personalized sections.

### Tests for US1 (write first and confirm failing baseline)

- [ ] T007 [P] [US1] Add contract/integration boundary test in tests/integration/newsletter-generation/test-receive-a-personalized-daily-paper-in-my-inbox-contracts.spec.ts
- [ ] T008 [P] [US1] Add unit test coverage in tests/unit/newsletter-generation/test-receive-a-personalized-daily-paper-in-my-inbox.spec.ts
- [ ] T009 [P] [US1] Add end-to-end scenario in tests/e2e/newsletter-generation/test-receive-a-personalized-daily-paper-in-my-inbox.e2e.ts

### Implementation for US1

- [ ] T010 [P] [US1] Create feature model/types in apps/api/src/features/newsletter-generation/receive-a-personalized-daily-paper-in-my-inbox.types.ts
- [ ] T011 [US1] Implement service logic in apps/api/src/features/newsletter-generation/receive-a-personalized-daily-paper-in-my-inbox.service.ts
- [ ] T012 [US1] Implement UI or endpoint integration in apps/web/src/features/newsletter-generation/receive-a-personalized-daily-paper-in-my-inbox.tsx
- [ ] T013 [US1] Add telemetry/audit hooks in apps/api/src/features/newsletter-generation/receive-a-personalized-daily-paper-in-my-inbox.telemetry.ts

## Phase 4: User Story 2 - My Newsletter Respects My Consent Choice (Priority: P1)

**Goal**: Enforce consent state during newsletter assembly.
**Independent Test**: Toggle consent off and verify generation pipeline excludes user output.

### Tests for US2 (write first and confirm failing baseline)

- [ ] T014 [P] [US2] Add contract/integration boundary test in tests/integration/newsletter-generation/test-my-newsletter-respects-my-consent-choice-contracts.spec.ts
- [ ] T015 [P] [US2] Add unit test coverage in tests/unit/newsletter-generation/test-my-newsletter-respects-my-consent-choice.spec.ts
- [ ] T016 [P] [US2] Add end-to-end scenario in tests/e2e/newsletter-generation/test-my-newsletter-respects-my-consent-choice.e2e.ts

### Implementation for US2

- [ ] T017 [P] [US2] Create feature model/types in apps/api/src/features/newsletter-generation/my-newsletter-respects-my-consent-choice.types.ts
- [ ] T018 [US2] Implement service logic in apps/api/src/features/newsletter-generation/my-newsletter-respects-my-consent-choice.service.ts
- [ ] T019 [US2] Implement UI or endpoint integration in apps/web/src/features/newsletter-generation/my-newsletter-respects-my-consent-choice.tsx
- [ ] T020 [US2] Add telemetry/audit hooks in apps/api/src/features/newsletter-generation/my-newsletter-respects-my-consent-choice.telemetry.ts

## Phase 5: User Story 3 - Read Clearly Attributed Stories With an Honest AI Label (Priority: P1)

**Goal**: Render attributed stories with explicit AI labels where applicable.
**Independent Test**: Inspect rendered output and verify attribution and AI labels on each story.

### Tests for US3 (write first and confirm failing baseline)

- [ ] T021 [P] [US3] Add contract/integration boundary test in tests/integration/newsletter-generation/test-read-clearly-attributed-stories-with-an-honest-ai-label-contracts.spec.ts
- [ ] T022 [P] [US3] Add unit test coverage in tests/unit/newsletter-generation/test-read-clearly-attributed-stories-with-an-honest-ai-label.spec.ts
- [ ] T023 [P] [US3] Add end-to-end scenario in tests/e2e/newsletter-generation/test-read-clearly-attributed-stories-with-an-honest-ai-label.e2e.ts

### Implementation for US3

- [ ] T024 [P] [US3] Create feature model/types in apps/api/src/features/newsletter-generation/read-clearly-attributed-stories-with-an-honest-ai-label.types.ts
- [ ] T025 [US3] Implement service logic in apps/api/src/features/newsletter-generation/read-clearly-attributed-stories-with-an-honest-ai-label.service.ts
- [ ] T026 [US3] Implement UI or endpoint integration in apps/web/src/features/newsletter-generation/read-clearly-attributed-stories-with-an-honest-ai-label.tsx
- [ ] T027 [US3] Add telemetry/audit hooks in apps/api/src/features/newsletter-generation/read-clearly-attributed-stories-with-an-honest-ai-label.telemetry.ts

## Phase 6: User Story 4 - Unsubscribe or Update Preferences From Inside the Email (Priority: P1)

**Goal**: Embed working manage-preferences and unsubscribe links in every email.
**Independent Test**: Open generated email and validate management links route correctly.

### Tests for US4 (write first and confirm failing baseline)

- [ ] T028 [P] [US4] Add contract/integration boundary test in tests/integration/newsletter-generation/test-unsubscribe-or-update-preferences-from-inside-the-email-contracts.spec.ts
- [ ] T029 [P] [US4] Add unit test coverage in tests/unit/newsletter-generation/test-unsubscribe-or-update-preferences-from-inside-the-email.spec.ts
- [ ] T030 [P] [US4] Add end-to-end scenario in tests/e2e/newsletter-generation/test-unsubscribe-or-update-preferences-from-inside-the-email.e2e.ts

### Implementation for US4

- [ ] T031 [P] [US4] Create feature model/types in apps/api/src/features/newsletter-generation/unsubscribe-or-update-preferences-from-inside-the-email.types.ts
- [ ] T032 [US4] Implement service logic in apps/api/src/features/newsletter-generation/unsubscribe-or-update-preferences-from-inside-the-email.service.ts
- [ ] T033 [US4] Implement UI or endpoint integration in apps/web/src/features/newsletter-generation/unsubscribe-or-update-preferences-from-inside-the-email.tsx
- [ ] T034 [US4] Add telemetry/audit hooks in apps/api/src/features/newsletter-generation/unsubscribe-or-update-preferences-from-inside-the-email.telemetry.ts

## Phase 7: User Story 5 - Receive a Readable Email on Any Device (Priority: P2)

**Goal**: Produce responsive and accessible HTML/Text email variants.
**Independent Test**: Render templates across viewport matrix and verify readability baselines.

### Tests for US5 (write first and confirm failing baseline)

- [ ] T035 [P] [US5] Add contract/integration boundary test in tests/integration/newsletter-generation/test-receive-a-readable-email-on-any-device-contracts.spec.ts
- [ ] T036 [P] [US5] Add unit test coverage in tests/unit/newsletter-generation/test-receive-a-readable-email-on-any-device.spec.ts
- [ ] T037 [P] [US5] Add end-to-end scenario in tests/e2e/newsletter-generation/test-receive-a-readable-email-on-any-device.e2e.ts

### Implementation for US5

- [ ] T038 [P] [US5] Create feature model/types in apps/api/src/features/newsletter-generation/receive-a-readable-email-on-any-device.types.ts
- [ ] T039 [US5] Implement service logic in apps/api/src/features/newsletter-generation/receive-a-readable-email-on-any-device.service.ts
- [ ] T040 [US5] Implement UI or endpoint integration in apps/web/src/features/newsletter-generation/receive-a-readable-email-on-any-device.tsx
- [ ] T041 [US5] Add telemetry/audit hooks in apps/api/src/features/newsletter-generation/receive-a-readable-email-on-any-device.telemetry.ts

## Phase 8: User Story 6 - Blog Highlight Appears When Available (Priority: P3)

**Goal**: Add optional blog highlight block when fresh blog content exists.
**Independent Test**: Generate newsletter with/without blog highlight fixture and verify conditional block.

### Tests for US6 (write first and confirm failing baseline)

- [ ] T042 [P] [US6] Add contract/integration boundary test in tests/integration/newsletter-generation/test-blog-highlight-appears-when-available-contracts.spec.ts
- [ ] T043 [P] [US6] Add unit test coverage in tests/unit/newsletter-generation/test-blog-highlight-appears-when-available.spec.ts
- [ ] T044 [P] [US6] Add end-to-end scenario in tests/e2e/newsletter-generation/test-blog-highlight-appears-when-available.e2e.ts

### Implementation for US6

- [ ] T045 [P] [US6] Create feature model/types in apps/api/src/features/newsletter-generation/blog-highlight-appears-when-available.types.ts
- [ ] T046 [US6] Implement service logic in apps/api/src/features/newsletter-generation/blog-highlight-appears-when-available.service.ts
- [ ] T047 [US6] Implement UI or endpoint integration in apps/web/src/features/newsletter-generation/blog-highlight-appears-when-available.tsx
- [ ] T048 [US6] Add telemetry/audit hooks in apps/api/src/features/newsletter-generation/blog-highlight-appears-when-available.telemetry.ts

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T049 [P] Update feature documentation and runbook notes in specs/features/newsletter-generation/quickstart.md
- [ ] T050 Run full test suite for this feature and capture results in specs/features/newsletter-generation/quickstart.md
- [ ] T051 Verify privacy-safe telemetry and consent/RBAC compliance for this feature in specs/features/newsletter-generation/spec.md

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