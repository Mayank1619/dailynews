# Tasks: Email Delivery + Scheduling

**Input**: Design documents from /specs/features/email-delivery/

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED by constitution and must be authored before implementation tasks in each user story phase.

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Confirm feature scope and dependencies in specs/features/email-delivery/spec.md
- [x] T002 Capture implementation assumptions in specs/features/email-delivery/plan.md
- [x] T003 [P] Prepare feature test folders in tests/unit/email-delivery/, tests/integration/email-delivery/, and tests/e2e/email-delivery/

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T004 Implement Firebase Auth eligibility checks (emailVerified, disabled, blocked claim) in apps/api/src/services/deliveryEligibilityService.ts
- [x] T005 [P] Create scheduler orchestration and queue contracts in apps/worker/src/features/email-delivery/scheduler.ts
- [x] T006 [P] Set up delivery audit and aggregate telemetry in apps/api/src/services/deliveryTelemetryService.ts

## Phase 3: User Story 1 - Receive My Newsletter at the Time I Chose (Priority: P1)

**Goal**: Deliver scheduled newsletters at user-selected times.
**Independent Test**: Run scheduling fixture and verify send windows match stored preference times.

### Tests for US1 (write first and confirm failing baseline)

- [x] T007 [P] [US1] Add contract/integration boundary test in tests/integration/email-delivery/test-receive-my-newsletter-at-the-time-i-chose-contracts.spec.ts
- [x] T008 [P] [US1] Add unit test coverage in tests/unit/email-delivery/test-receive-my-newsletter-at-the-time-i-chose.spec.ts
- [x] T009 [P] [US1] Add end-to-end scenario in tests/e2e/email-delivery/test-receive-my-newsletter-at-the-time-i-chose.e2e.ts

### Implementation for US1

- [x] T010 [P] [US1] Create feature model/types in apps/api/src/features/email-delivery/receive-my-newsletter-at-the-time-i-chose.types.ts
- [x] T011 [US1] Implement service logic in apps/api/src/features/email-delivery/receive-my-newsletter-at-the-time-i-chose.service.ts
- [x] T012 [US1] Implement UI or endpoint integration in apps/web/src/features/email-delivery/receive-my-newsletter-at-the-time-i-chose.tsx
- [x] T013 [US1] Add telemetry/audit hooks in apps/api/src/features/email-delivery/receive-my-newsletter-at-the-time-i-chose.telemetry.ts

## Phase 4: User Story 2 - Delivery Succeeds Even When the First Attempt Fails (Priority: P1)

**Goal**: Retry failed sends with resilient backoff.
**Independent Test**: Force transient SMTP failure and verify retry eventually succeeds.

### Tests for US2 (write first and confirm failing baseline)

- [x] T014 [P] [US2] Add contract/integration boundary test in tests/integration/email-delivery/test-delivery-succeeds-even-when-the-first-attempt-fails-contracts.spec.ts
- [x] T015 [P] [US2] Add unit test coverage in tests/unit/email-delivery/test-delivery-succeeds-even-when-the-first-attempt-fails.spec.ts
- [x] T016 [P] [US2] Add end-to-end scenario in tests/e2e/email-delivery/test-delivery-succeeds-even-when-the-first-attempt-fails.e2e.ts

### Implementation for US2

- [x] T017 [P] [US2] Create feature model/types in apps/api/src/features/email-delivery/delivery-succeeds-even-when-the-first-attempt-fails.types.ts
- [x] T018 [US2] Implement service logic in apps/api/src/features/email-delivery/delivery-succeeds-even-when-the-first-attempt-fails.service.ts
- [x] T019 [US2] Implement UI or endpoint integration in apps/web/src/features/email-delivery/delivery-succeeds-even-when-the-first-attempt-fails.tsx
- [x] T020 [US2] Add telemetry/audit hooks in apps/api/src/features/email-delivery/delivery-succeeds-even-when-the-first-attempt-fails.telemetry.ts

## Phase 5: User Story 3 - My Unsubscribe Request Is Honoured Immediately (Priority: P1)

**Goal**: Apply unsubscribe changes immediately to delivery eligibility.
**Independent Test**: Trigger unsubscribe and verify subsequent delivery job excludes user.

### Tests for US3 (write first and confirm failing baseline)

- [x] T021 [P] [US3] Add contract/integration boundary test in tests/integration/email-delivery/test-my-unsubscribe-request-is-honoured-immediately-contracts.spec.ts
- [x] T022 [P] [US3] Add unit test coverage in tests/unit/email-delivery/test-my-unsubscribe-request-is-honoured-immediately.spec.ts
- [x] T023 [P] [US3] Add end-to-end scenario in tests/e2e/email-delivery/test-my-unsubscribe-request-is-honoured-immediately.e2e.ts

### Implementation for US3

- [x] T024 [P] [US3] Create feature model/types in apps/api/src/features/email-delivery/my-unsubscribe-request-is-honoured-immediately.types.ts
- [x] T025 [US3] Implement service logic in apps/api/src/features/email-delivery/my-unsubscribe-request-is-honoured-immediately.service.ts
- [x] T026 [US3] Implement UI or endpoint integration in apps/web/src/features/email-delivery/my-unsubscribe-request-is-honoured-immediately.tsx
- [x] T027 [US3] Add telemetry/audit hooks in apps/api/src/features/email-delivery/my-unsubscribe-request-is-honoured-immediately.telemetry.ts

## Phase 6: User Story 4 - Unverified and Blocked Users Are Never Sent Email (Priority: P1)

**Goal**: Enforce strict identity eligibility checks before send.
**Independent Test**: Seed blocked/unverified users and verify zero sends are issued.

### Tests for US4 (write first and confirm failing baseline)

- [x] T028 [P] [US4] Add contract/integration boundary test in tests/integration/email-delivery/test-unverified-and-blocked-users-are-never-sent-email-contracts.spec.ts
- [x] T029 [P] [US4] Add unit test coverage in tests/unit/email-delivery/test-unverified-and-blocked-users-are-never-sent-email.spec.ts
- [x] T030 [P] [US4] Add end-to-end scenario in tests/e2e/email-delivery/test-unverified-and-blocked-users-are-never-sent-email.e2e.ts

### Implementation for US4

- [x] T031 [P] [US4] Create feature model/types in apps/api/src/features/email-delivery/unverified-and-blocked-users-are-never-sent-email.types.ts
- [x] T032 [US4] Implement service logic in apps/api/src/features/email-delivery/unverified-and-blocked-users-are-never-sent-email.service.ts
- [x] T033 [US4] Implement UI or endpoint integration in apps/web/src/features/email-delivery/unverified-and-blocked-users-are-never-sent-email.tsx
- [x] T034 [US4] Add telemetry/audit hooks in apps/api/src/features/email-delivery/unverified-and-blocked-users-are-never-sent-email.telemetry.ts

## Phase 7: User Story 5 - Operators Can See Delivery Health Without Accessing Personal Data (Priority: P2)

**Goal**: Expose aggregate delivery health dashboards with privacy-safe metrics.
**Independent Test**: Open ops dashboard and verify aggregate metrics without personal identifiers.

### Tests for US5 (write first and confirm failing baseline)

- [x] T035 [P] [US5] Add contract/integration boundary test in tests/integration/email-delivery/test-operators-can-see-delivery-health-without-accessing-personal-data-contracts.spec.ts
- [x] T036 [P] [US5] Add unit test coverage in tests/unit/email-delivery/test-operators-can-see-delivery-health-without-accessing-personal-data.spec.ts
- [x] T037 [P] [US5] Add end-to-end scenario in tests/e2e/email-delivery/test-operators-can-see-delivery-health-without-accessing-personal-data.e2e.ts

### Implementation for US5

- [x] T038 [P] [US5] Create feature model/types in apps/api/src/features/email-delivery/operators-can-see-delivery-health-without-accessing-personal-data.types.ts
- [x] T039 [US5] Implement service logic in apps/api/src/features/email-delivery/operators-can-see-delivery-health-without-accessing-personal-data.service.ts
- [x] T040 [US5] Implement UI or endpoint integration in apps/web/src/features/email-delivery/operators-can-see-delivery-health-without-accessing-personal-data.tsx
- [x] T041 [US5] Add telemetry/audit hooks in apps/api/src/features/email-delivery/operators-can-see-delivery-health-without-accessing-personal-data.telemetry.ts

## Final Phase: Polish & Cross-Cutting Concerns

- [x] T042 [P] Update feature documentation and runbook notes in specs/features/email-delivery/quickstart.md
- [x] T043 Run full test suite for this feature and capture results in specs/features/email-delivery/quickstart.md
- [x] T044 Verify privacy-safe telemetry and consent/RBAC compliance for this feature in specs/features/email-delivery/spec.md

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
