# Tasks: Onboarding + Preferences

**Input**: Design documents from /specs/features/onboarding-preferences/

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED by constitution and must be authored before implementation tasks in each user story phase.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Confirm feature scope and dependencies in specs/features/onboarding-preferences/spec.md
- [ ] T002 Capture implementation assumptions in specs/features/onboarding-preferences/plan.md
- [ ] T003 [P] Prepare feature test folders in tests/unit/onboarding-preferences/, tests/integration/onboarding-preferences/, and tests/e2e/onboarding-preferences/

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 Implement Firebase Auth session guard and UID ownership checks in apps/api/src/middleware/firebaseAuth.ts
- [ ] T005 Create preferences repository with consent-safe fields in apps/api/src/features/onboarding-preferences/preferencesRepository.ts
- [ ] T006 [P] Set up onboarding audit and telemetry events in apps/api/src/features/onboarding-preferences/telemetry.ts

## Phase 3: User Story 1 - Complete First-Time Onboarding (Priority: P1)

**Goal**: Guide new users through first-time preference capture.
**Independent Test**: Complete onboarding flow and verify preferences persist for authenticated user UID.

### Tests for US1 (write first and confirm failing baseline)

- [ ] T007 [P] [US1] Add contract/integration boundary test in tests/integration/onboarding-preferences/test-complete-first-time-onboarding-contracts.spec.ts
- [ ] T008 [P] [US1] Add unit test coverage in tests/unit/onboarding-preferences/test-complete-first-time-onboarding.spec.ts
- [ ] T009 [P] [US1] Add end-to-end scenario in tests/e2e/onboarding-preferences/test-complete-first-time-onboarding.e2e.ts

### Implementation for US1

- [ ] T010 [P] [US1] Create feature model/types in apps/api/src/features/onboarding-preferences/complete-first-time-onboarding.types.ts
- [ ] T011 [US1] Implement service logic in apps/api/src/features/onboarding-preferences/complete-first-time-onboarding.service.ts
- [ ] T012 [US1] Implement UI or endpoint integration in apps/web/src/features/onboarding-preferences/complete-first-time-onboarding.tsx
- [ ] T013 [US1] Add telemetry/audit hooks in apps/api/src/features/onboarding-preferences/complete-first-time-onboarding.telemetry.ts

## Phase 4: User Story 2 - Update Preferences Anytime (Priority: P2)

**Goal**: Allow users to edit saved preferences at any time.
**Independent Test**: Update existing preference fields and verify dashboard/read models refresh correctly.

### Tests for US2 (write first and confirm failing baseline)

- [ ] T014 [P] [US2] Add contract/integration boundary test in tests/integration/onboarding-preferences/test-update-preferences-anytime-contracts.spec.ts
- [ ] T015 [P] [US2] Add unit test coverage in tests/unit/onboarding-preferences/test-update-preferences-anytime.spec.ts
- [ ] T016 [P] [US2] Add end-to-end scenario in tests/e2e/onboarding-preferences/test-update-preferences-anytime.e2e.ts

### Implementation for US2

- [ ] T017 [P] [US2] Create feature model/types in apps/api/src/features/onboarding-preferences/update-preferences-anytime.types.ts
- [ ] T018 [US2] Implement service logic in apps/api/src/features/onboarding-preferences/update-preferences-anytime.service.ts
- [ ] T019 [US2] Implement UI or endpoint integration in apps/web/src/features/onboarding-preferences/update-preferences-anytime.tsx
- [ ] T020 [US2] Add telemetry/audit hooks in apps/api/src/features/onboarding-preferences/update-preferences-anytime.telemetry.ts

## Phase 5: User Story 3 - Pause or Resume Delivery (Priority: P3)

**Goal**: Allow reversible delivery pause/resume controls.
**Independent Test**: Toggle delivery state and verify preference flag transitions without data loss.

### Tests for US3 (write first and confirm failing baseline)

- [ ] T021 [P] [US3] Add contract/integration boundary test in tests/integration/onboarding-preferences/test-pause-or-resume-delivery-contracts.spec.ts
- [ ] T022 [P] [US3] Add unit test coverage in tests/unit/onboarding-preferences/test-pause-or-resume-delivery.spec.ts
- [ ] T023 [P] [US3] Add end-to-end scenario in tests/e2e/onboarding-preferences/test-pause-or-resume-delivery.e2e.ts

### Implementation for US3

- [ ] T024 [P] [US3] Create feature model/types in apps/api/src/features/onboarding-preferences/pause-or-resume-delivery.types.ts
- [ ] T025 [US3] Implement service logic in apps/api/src/features/onboarding-preferences/pause-or-resume-delivery.service.ts
- [ ] T026 [US3] Implement UI or endpoint integration in apps/web/src/features/onboarding-preferences/pause-or-resume-delivery.tsx
- [ ] T027 [US3] Add telemetry/audit hooks in apps/api/src/features/onboarding-preferences/pause-or-resume-delivery.telemetry.ts

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T028 [P] Update feature documentation and runbook notes in specs/features/onboarding-preferences/quickstart.md
- [ ] T029 Run full test suite for this feature and capture results in specs/features/onboarding-preferences/quickstart.md
- [ ] T030 Verify privacy-safe telemetry and consent/RBAC compliance for this feature in specs/features/onboarding-preferences/spec.md

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