# Tasks: Admin Dashboard (RBAC)

**Input**: Design documents from /specs/features/admin-dashboard/

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED by constitution and must be authored before implementation tasks in each user story phase.

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Confirm feature scope and dependencies in specs/features/admin-dashboard/spec.md
- [X] T002 Capture implementation assumptions in specs/features/admin-dashboard/plan.md
- [X] T003 [P] Prepare feature test folders in tests/unit/admin-dashboard/, tests/integration/admin-dashboard/, and tests/e2e/admin-dashboard/

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T004 Implement Firebase Auth ID token verification middleware in apps/api/src/middleware/firebaseAuth.ts
- [X] T005 Implement admin RBAC custom-claims guard in apps/api/src/middleware/rbacClaims.ts
- [X] T006 Create admin audit-log service for privileged actions in apps/api/src/services/adminAuditLogService.ts

## Phase 3: User Story 1 - Secure Admin Access and Governance (Priority: P1)

**Goal**: Allow only properly authorized admins to access governance surfaces.
**Independent Test**: Sign in with and without admin claim and verify only valid admins can open dashboard routes.

### Tests for US1 (write first and confirm failing baseline)

- [X] T007 [P] [US1] Add contract/integration boundary test in tests/integration/admin-dashboard/test-secure-admin-access-and-governance-contracts.spec.ts
- [X] T008 [P] [US1] Add unit test coverage in tests/unit/admin-dashboard/test-secure-admin-access-and-governance.spec.ts
- [X] T009 [P] [US1] Add end-to-end scenario in tests/e2e/admin-dashboard/test-secure-admin-access-and-governance.e2e.ts

### Implementation for US1

- [X] T010 [P] [US1] Create feature model/types in apps/api/src/features/admin-dashboard/secure-admin-access-and-governance.types.ts
- [X] T011 [US1] Implement service logic in apps/api/src/features/admin-dashboard/secure-admin-access-and-governance.service.ts
- [X] T012 [US1] Implement UI or endpoint integration in apps/web/src/features/admin-dashboard/secure-admin-access-and-governance.tsx
- [X] T013 [US1] Add telemetry/audit hooks in apps/api/src/features/admin-dashboard/secure-admin-access-and-governance.telemetry.ts

## Phase 4: User Story 2 - Manage Users and Consent State (Priority: P1)

**Goal**: Let admins review and update user consent-safe account state.
**Independent Test**: Update user state from admin UI and verify audit entries plus data consistency.

### Tests for US2 (write first and confirm failing baseline)

- [X] T014 [P] [US2] Add contract/integration boundary test in tests/integration/admin-dashboard/test-manage-users-and-consent-state-contracts.spec.ts
- [X] T015 [P] [US2] Add unit test coverage in tests/unit/admin-dashboard/test-manage-users-and-consent-state.spec.ts
- [X] T016 [P] [US2] Add end-to-end scenario in tests/e2e/admin-dashboard/test-manage-users-and-consent-state.e2e.ts

### Implementation for US2

- [X] T017 [P] [US2] Create feature model/types in apps/api/src/features/admin-dashboard/manage-users-and-consent-state.types.ts
- [X] T018 [US2] Implement service logic in apps/api/src/features/admin-dashboard/manage-users-and-consent-state.service.ts
- [X] T019 [US2] Implement UI or endpoint integration in apps/web/src/features/admin-dashboard/manage-users-and-consent-state.tsx
- [X] T020 [US2] Add telemetry/audit hooks in apps/api/src/features/admin-dashboard/manage-users-and-consent-state.telemetry.ts

## Phase 5: User Story 3 - Manage Sources, Editorial Content, and Testimonials (Priority: P2)

**Goal**: Provide operational controls for source and editorial records.
**Independent Test**: Create and update source/editorial records and verify listing reflects changes.

### Tests for US3 (write first and confirm failing baseline)

- [X] T021 [P] [US3] Add contract/integration boundary test in tests/integration/admin-dashboard/test-manage-sources-editorial-content-and-testimonials-contracts.spec.ts
- [X] T022 [P] [US3] Add unit test coverage in tests/unit/admin-dashboard/test-manage-sources-editorial-content-and-testimonials.spec.ts
- [X] T023 [P] [US3] Add end-to-end scenario in tests/e2e/admin-dashboard/test-manage-sources-editorial-content-and-testimonials.e2e.ts

### Implementation for US3

- [X] T024 [P] [US3] Create feature model/types in apps/api/src/features/admin-dashboard/manage-sources-editorial-content-and-testimonials.types.ts
- [X] T025 [US3] Implement service logic in apps/api/src/features/admin-dashboard/manage-sources-editorial-content-and-testimonials.service.ts
- [X] T026 [US3] Implement UI or endpoint integration in apps/web/src/features/admin-dashboard/manage-sources-editorial-content-and-testimonials.tsx
- [X] T027 [US3] Add telemetry/audit hooks in apps/api/src/features/admin-dashboard/manage-sources-editorial-content-and-testimonials.telemetry.ts

## Phase 6: User Story 4 - Export Consent-Safe Lists and Review Health Metrics (Priority: P2)

**Goal**: Export safe aggregates and view dashboard health metrics.
**Independent Test**: Run export and metrics view; verify no personal data leaks in output.

### Tests for US4 (write first and confirm failing baseline)

- [X] T028 [P] [US4] Add contract/integration boundary test in tests/integration/admin-dashboard/test-export-consent-safe-lists-and-review-health-metrics-contracts.spec.ts
- [X] T029 [P] [US4] Add unit test coverage in tests/unit/admin-dashboard/test-export-consent-safe-lists-and-review-health-metrics.spec.ts
- [X] T030 [P] [US4] Add end-to-end scenario in tests/e2e/admin-dashboard/test-export-consent-safe-lists-and-review-health-metrics.e2e.ts

### Implementation for US4

- [X] T031 [P] [US4] Create feature model/types in apps/api/src/features/admin-dashboard/export-consent-safe-lists-and-review-health-metrics.types.ts
- [X] T032 [US4] Implement service logic in apps/api/src/features/admin-dashboard/export-consent-safe-lists-and-review-health-metrics.service.ts
- [X] T033 [US4] Implement UI or endpoint integration in apps/web/src/features/admin-dashboard/export-consent-safe-lists-and-review-health-metrics.tsx
- [X] T034 [US4] Add telemetry/audit hooks in apps/api/src/features/admin-dashboard/export-consent-safe-lists-and-review-health-metrics.telemetry.ts

## Final Phase: Polish & Cross-Cutting Concerns

- [X] T035 [P] Update feature documentation and runbook notes in specs/features/admin-dashboard/quickstart.md
- [X] T036 Run full test suite for this feature and capture results in specs/features/admin-dashboard/quickstart.md
- [X] T037 Verify privacy-safe telemetry and consent/RBAC compliance for this feature in specs/features/admin-dashboard/spec.md

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