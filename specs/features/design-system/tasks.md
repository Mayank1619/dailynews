# Tasks: Design System

**Input**: Design documents from /specs/features/design-system/

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED by constitution and must be authored before implementation tasks in each user story phase.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Confirm feature scope and dependencies in specs/features/design-system/spec.md
- [ ] T002 Capture implementation assumptions in specs/features/design-system/plan.md
- [ ] T003 [P] Prepare feature test folders in tests/unit/design-system/, tests/integration/design-system/, and tests/e2e/design-system/

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 Create base design tokens in apps/web/src/features/design-system/tokens.ts
- [ ] T005 Set up component story scaffolding in apps/web/src/features/design-system/stories/index.stories.tsx
- [ ] T006 Configure accessibility regression checks in apps/web/tests/a11y/design-system.a11y.test.ts

## Phase 3: User Story 1 - Establish Shared Visual Rules (Priority: P1)

**Goal**: Define shared tokens, layout rules, and accessibility baselines.
**Independent Test**: Render token-driven sample page and verify contrast and spacing rules pass.

### Tests for US1 (write first and confirm failing baseline)

- [ ] T007 [P] [US1] Add contract/integration boundary test in tests/integration/design-system/test-establish-shared-visual-rules-contracts.spec.ts
- [ ] T008 [P] [US1] Add unit test coverage in tests/unit/design-system/test-establish-shared-visual-rules.spec.ts
- [ ] T009 [P] [US1] Add end-to-end scenario in tests/e2e/design-system/test-establish-shared-visual-rules.e2e.ts

### Implementation for US1

- [ ] T010 [P] [US1] Create feature model/types in apps/api/src/features/design-system/establish-shared-visual-rules.types.ts
- [ ] T011 [US1] Implement service logic in apps/api/src/features/design-system/establish-shared-visual-rules.service.ts
- [ ] T012 [US1] Implement UI or endpoint integration in apps/web/src/features/design-system/establish-shared-visual-rules.tsx
- [ ] T013 [US1] Add telemetry/audit hooks in apps/api/src/features/design-system/establish-shared-visual-rules.telemetry.ts

## Phase 4: User Story 2 - Reuse Core Components Across Features (Priority: P2)

**Goal**: Provide reusable components consumed by multiple product surfaces.
**Independent Test**: Use components in at least two feature pages and verify consistent behavior.

### Tests for US2 (write first and confirm failing baseline)

- [ ] T014 [P] [US2] Add contract/integration boundary test in tests/integration/design-system/test-reuse-core-components-across-features-contracts.spec.ts
- [ ] T015 [P] [US2] Add unit test coverage in tests/unit/design-system/test-reuse-core-components-across-features.spec.ts
- [ ] T016 [P] [US2] Add end-to-end scenario in tests/e2e/design-system/test-reuse-core-components-across-features.e2e.ts

### Implementation for US2

- [ ] T017 [P] [US2] Create feature model/types in apps/api/src/features/design-system/reuse-core-components-across-features.types.ts
- [ ] T018 [US2] Implement service logic in apps/api/src/features/design-system/reuse-core-components-across-features.service.ts
- [ ] T019 [US2] Implement UI or endpoint integration in apps/web/src/features/design-system/reuse-core-components-across-features.tsx
- [ ] T020 [US2] Add telemetry/audit hooks in apps/api/src/features/design-system/reuse-core-components-across-features.telemetry.ts

## Phase 5: User Story 3 - Support Design Review and Figma Alignment (Priority: P3)

**Goal**: Align implementation output with design review artifacts.
**Independent Test**: Run design review checklist and verify mapped components pass acceptance.

### Tests for US3 (write first and confirm failing baseline)

- [ ] T021 [P] [US3] Add contract/integration boundary test in tests/integration/design-system/test-support-design-review-and-figma-alignment-contracts.spec.ts
- [ ] T022 [P] [US3] Add unit test coverage in tests/unit/design-system/test-support-design-review-and-figma-alignment.spec.ts
- [ ] T023 [P] [US3] Add end-to-end scenario in tests/e2e/design-system/test-support-design-review-and-figma-alignment.e2e.ts

### Implementation for US3

- [ ] T024 [P] [US3] Create feature model/types in apps/api/src/features/design-system/support-design-review-and-figma-alignment.types.ts
- [ ] T025 [US3] Implement service logic in apps/api/src/features/design-system/support-design-review-and-figma-alignment.service.ts
- [ ] T026 [US3] Implement UI or endpoint integration in apps/web/src/features/design-system/support-design-review-and-figma-alignment.tsx
- [ ] T027 [US3] Add telemetry/audit hooks in apps/api/src/features/design-system/support-design-review-and-figma-alignment.telemetry.ts

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T028 [P] Update feature documentation and runbook notes in specs/features/design-system/quickstart.md
- [ ] T029 Run full test suite for this feature and capture results in specs/features/design-system/quickstart.md
- [ ] T030 Verify privacy-safe telemetry and consent/RBAC compliance for this feature in specs/features/design-system/spec.md

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