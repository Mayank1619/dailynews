# Tasks: Authentication + Consent

**Input**: Design documents from /specs/features/authentication-consent/

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED by constitution and must be authored before implementation tasks in each user story phase.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Confirm feature scope and dependencies in specs/features/authentication-consent/spec.md
- [ ] T002 Capture implementation assumptions in specs/features/authentication-consent/plan.md
- [ ] T003 [P] Prepare feature test folders in tests/unit/authentication-consent/, tests/integration/authentication-consent/, and tests/e2e/authentication-consent/

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 Configure Firebase Auth client SDK bootstrap in apps/web/src/lib/firebaseAuthClient.ts
- [ ] T005 Implement Firebase Admin ID-token verification in apps/api/src/middleware/firebaseAuth.ts
- [ ] T006 Create consent and identity audit logging service in apps/api/src/services/consentAuditService.ts

## Phase 3: User Story 1 - Secure Signup with Explicit Consent (Priority: P1)

**Goal**: Capture explicit consent during signup with secure identity creation.
**Independent Test**: Complete signup and verify Firebase user creation plus consent record persistence.

### Tests for US1 (write first and confirm failing baseline)

- [ ] T007 [P] [US1] Add contract/integration boundary test in tests/integration/authentication-consent/test-secure-signup-with-explicit-consent-contracts.spec.ts
- [ ] T008 [P] [US1] Add unit test coverage in tests/unit/authentication-consent/test-secure-signup-with-explicit-consent.spec.ts
- [ ] T009 [P] [US1] Add end-to-end scenario in tests/e2e/authentication-consent/test-secure-signup-with-explicit-consent.e2e.ts

### Implementation for US1

- [ ] T010 [P] [US1] Create feature model/types in apps/api/src/features/authentication-consent/secure-signup-with-explicit-consent.types.ts
- [ ] T011 [US1] Implement service logic in apps/api/src/features/authentication-consent/secure-signup-with-explicit-consent.service.ts
- [ ] T012 [US1] Implement UI or endpoint integration in apps/web/src/features/authentication-consent/secure-signup-with-explicit-consent.tsx
- [ ] T013 [US1] Add telemetry/audit hooks in apps/api/src/features/authentication-consent/secure-signup-with-explicit-consent.telemetry.ts

## Phase 4: User Story 2 - Login, Logout, and Password Recovery (Priority: P2)

**Goal**: Provide reliable session lifecycle and account recovery.
**Independent Test**: Perform login/logout/reset flows and confirm expected route/session behavior.

### Tests for US2 (write first and confirm failing baseline)

- [ ] T014 [P] [US2] Add contract/integration boundary test in tests/integration/authentication-consent/test-login-logout-and-password-recovery-contracts.spec.ts
- [ ] T015 [P] [US2] Add unit test coverage in tests/unit/authentication-consent/test-login-logout-and-password-recovery.spec.ts
- [ ] T016 [P] [US2] Add end-to-end scenario in tests/e2e/authentication-consent/test-login-logout-and-password-recovery.e2e.ts

### Implementation for US2

- [ ] T017 [P] [US2] Create feature model/types in apps/api/src/features/authentication-consent/login-logout-and-password-recovery.types.ts
- [ ] T018 [US2] Implement service logic in apps/api/src/features/authentication-consent/login-logout-and-password-recovery.service.ts
- [ ] T019 [US2] Implement UI or endpoint integration in apps/web/src/features/authentication-consent/login-logout-and-password-recovery.tsx
- [ ] T020 [US2] Add telemetry/audit hooks in apps/api/src/features/authentication-consent/login-logout-and-password-recovery.telemetry.ts

## Phase 5: User Story 3 - Blocked Account Enforcement (Priority: P3)

**Goal**: Prevent blocked users from accessing protected experiences.
**Independent Test**: Mark account blocked and confirm protected routes and APIs deny access.

### Tests for US3 (write first and confirm failing baseline)

- [ ] T021 [P] [US3] Add contract/integration boundary test in tests/integration/authentication-consent/test-blocked-account-enforcement-contracts.spec.ts
- [ ] T022 [P] [US3] Add unit test coverage in tests/unit/authentication-consent/test-blocked-account-enforcement.spec.ts
- [ ] T023 [P] [US3] Add end-to-end scenario in tests/e2e/authentication-consent/test-blocked-account-enforcement.e2e.ts

### Implementation for US3

- [ ] T024 [P] [US3] Create feature model/types in apps/api/src/features/authentication-consent/blocked-account-enforcement.types.ts
- [ ] T025 [US3] Implement service logic in apps/api/src/features/authentication-consent/blocked-account-enforcement.service.ts
- [ ] T026 [US3] Implement UI or endpoint integration in apps/web/src/features/authentication-consent/blocked-account-enforcement.tsx
- [ ] T027 [US3] Add telemetry/audit hooks in apps/api/src/features/authentication-consent/blocked-account-enforcement.telemetry.ts

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T028 [P] Update feature documentation and runbook notes in specs/features/authentication-consent/quickstart.md
- [ ] T029 Run full test suite for this feature and capture results in specs/features/authentication-consent/quickstart.md
- [ ] T030 Verify privacy-safe telemetry and consent/RBAC compliance for this feature in specs/features/authentication-consent/spec.md

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