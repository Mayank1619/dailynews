# Tasks: User Dashboard + Newsletter History

**Input**: Design documents from /specs/features/user-dashboard/

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED by constitution and must be authored before implementation tasks in each user story phase.

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Confirm feature scope and dependencies in specs/features/user-dashboard/spec.md
- [X] T002 Capture implementation assumptions in specs/features/user-dashboard/plan.md
- [X] T003 [P] Prepare feature test folders in tests/unit/user-dashboard/, tests/integration/user-dashboard/, and tests/e2e/user-dashboard/

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T004 Implement Firebase Auth session guard and UID ownership enforcement in apps/api/src/middleware/firebaseAuth.ts
- [X] T005 Create dashboard query service scoped by authenticated UID in apps/api/src/features/user-dashboard/dashboardService.ts
- [X] T006 [P] Set up dashboard audit and privacy-safe telemetry in apps/api/src/features/user-dashboard/telemetry.ts

## Phase 3: User Story 1 - View My Dashboard Home (Priority: P1)

**Goal**: Show authenticated users preference summary and recent history.
**Independent Test**: Sign in and verify dashboard cards and history list display only owner data.

### Tests for US1 (write first and confirm failing baseline)

- [X] T007 [P] [US1] Add contract/integration boundary test in tests/integration/user-dashboard/test-view-my-dashboard-home-contracts.spec.ts
- [X] T008 [P] [US1] Add unit test coverage in tests/unit/user-dashboard/test-view-my-dashboard-home.spec.ts
- [X] T009 [P] [US1] Add end-to-end scenario in tests/e2e/user-dashboard/test-view-my-dashboard-home.e2e.ts

### Implementation for US1

- [X] T010 [P] [US1] Create feature model/types in apps/api/src/features/user-dashboard/view-my-dashboard-home.types.ts
- [X] T011 [US1] Implement service logic in apps/api/src/features/user-dashboard/view-my-dashboard-home.service.ts
- [X] T012 [US1] Implement UI or endpoint integration in apps/web/src/features/user-dashboard/view-my-dashboard-home.tsx
- [X] T013 [US1] Add telemetry/audit hooks in apps/api/src/features/user-dashboard/view-my-dashboard-home.telemetry.ts

## Phase 4: User Story 2 - Edit My Preferences from the Dashboard (Priority: P2)

**Goal**: Provide direct navigation to preference editing and reflect saved changes.
**Independent Test**: Navigate to editor, save change, return, and verify updated summary values.

### Tests for US2 (write first and confirm failing baseline)

- [X] T014 [P] [US2] Add contract/integration boundary test in tests/integration/user-dashboard/test-edit-my-preferences-from-the-dashboard-contracts.spec.ts
- [X] T015 [P] [US2] Add unit test coverage in tests/unit/user-dashboard/test-edit-my-preferences-from-the-dashboard.spec.ts
- [X] T016 [P] [US2] Add end-to-end scenario in tests/e2e/user-dashboard/test-edit-my-preferences-from-the-dashboard.e2e.ts

### Implementation for US2

- [X] T017 [P] [US2] Create feature model/types in apps/api/src/features/user-dashboard/edit-my-preferences-from-the-dashboard.types.ts
- [X] T018 [US2] Implement service logic in apps/api/src/features/user-dashboard/edit-my-preferences-from-the-dashboard.service.ts
- [X] T019 [US2] Implement UI or endpoint integration in apps/web/src/features/user-dashboard/edit-my-preferences-from-the-dashboard.tsx
- [X] T020 [US2] Add telemetry/audit hooks in apps/api/src/features/user-dashboard/edit-my-preferences-from-the-dashboard.telemetry.ts

## Phase 5: User Story 3 - Pause or Resume Newsletter Delivery (Priority: P2)

**Goal**: Allow reversible delivery state control from dashboard.
**Independent Test**: Toggle pause/resume and verify persisted state plus downstream send behavior.

### Tests for US3 (write first and confirm failing baseline)

- [X] T021 [P] [US3] Add contract/integration boundary test in tests/integration/user-dashboard/test-pause-or-resume-newsletter-delivery-contracts.spec.ts
- [X] T022 [P] [US3] Add unit test coverage in tests/unit/user-dashboard/test-pause-or-resume-newsletter-delivery.spec.ts
- [X] T023 [P] [US3] Add end-to-end scenario in tests/e2e/user-dashboard/test-pause-or-resume-newsletter-delivery.e2e.ts

### Implementation for US3

- [X] T024 [P] [US3] Create feature model/types in apps/api/src/features/user-dashboard/pause-or-resume-newsletter-delivery.types.ts
- [X] T025 [US3] Implement service logic in apps/api/src/features/user-dashboard/pause-or-resume-newsletter-delivery.service.ts
- [X] T026 [US3] Implement UI or endpoint integration in apps/web/src/features/user-dashboard/pause-or-resume-newsletter-delivery.tsx
- [X] T027 [US3] Add telemetry/audit hooks in apps/api/src/features/user-dashboard/pause-or-resume-newsletter-delivery.telemetry.ts

## Phase 6: User Story 4 - View and Access Past Newsletters (Priority: P2)

**Goal**: Provide sortable history with web-view links when available.
**Independent Test**: Seed mixed email logs and verify statuses, order, and link behavior.

### Tests for US4 (write first and confirm failing baseline)

- [X] T028 [P] [US4] Add contract/integration boundary test in tests/integration/user-dashboard/test-view-and-access-past-newsletters-contracts.spec.ts
- [X] T029 [P] [US4] Add unit test coverage in tests/unit/user-dashboard/test-view-and-access-past-newsletters.spec.ts
- [X] T030 [P] [US4] Add end-to-end scenario in tests/e2e/user-dashboard/test-view-and-access-past-newsletters.e2e.ts

### Implementation for US4

- [ ] T031 [P] [US4] Create feature model/types in apps/api/src/features/user-dashboard/view-and-access-past-newsletters.types.ts
- [ ] T032 [US4] Implement service logic in apps/api/src/features/user-dashboard/view-and-access-past-newsletters.service.ts
- [ ] T033 [US4] Implement UI or endpoint integration in apps/web/src/features/user-dashboard/view-and-access-past-newsletters.tsx
- [ ] T034 [US4] Add telemetry/audit hooks in apps/api/src/features/user-dashboard/view-and-access-past-newsletters.telemetry.ts

## Phase 7: User Story 5 - Account Settings: Logout and Delete Account (Priority: P3)

**Goal**: Provide secure session logout and optional account deletion controls.
**Independent Test**: Execute logout/delete flows and verify immediate session revocation + deletion workflow.

### Tests for US5 (write first and confirm failing baseline)

- [ ] T035 [P] [US5] Add contract/integration boundary test in tests/integration/user-dashboard/test-account-settings-logout-and-delete-account-contracts.spec.ts
- [ ] T036 [P] [US5] Add unit test coverage in tests/unit/user-dashboard/test-account-settings-logout-and-delete-account.spec.ts
- [ ] T037 [P] [US5] Add end-to-end scenario in tests/e2e/user-dashboard/test-account-settings-logout-and-delete-account.e2e.ts

### Implementation for US5

- [ ] T038 [P] [US5] Create feature model/types in apps/api/src/features/user-dashboard/account-settings-logout-and-delete-account.types.ts
- [ ] T039 [US5] Implement service logic in apps/api/src/features/user-dashboard/account-settings-logout-and-delete-account.service.ts
- [ ] T040 [US5] Implement UI or endpoint integration in apps/web/src/features/user-dashboard/account-settings-logout-and-delete-account.tsx
- [ ] T041 [US5] Add telemetry/audit hooks in apps/api/src/features/user-dashboard/account-settings-logout-and-delete-account.telemetry.ts

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T042 [P] Update feature documentation and runbook notes in specs/features/user-dashboard/quickstart.md
- [ ] T043 Run full test suite for this feature and capture results in specs/features/user-dashboard/quickstart.md
- [ ] T044 Verify privacy-safe telemetry and consent/RBAC compliance for this feature in specs/features/user-dashboard/spec.md

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