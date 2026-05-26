# Tasks: Public Site + Landing

**Input**: Design documents from /specs/features/public-site/

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED by constitution and must be authored before implementation tasks in each user story phase.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Confirm feature scope and dependencies in specs/features/public-site/spec.md
- [ ] T002 Capture implementation assumptions in specs/features/public-site/plan.md
- [ ] T003 [P] Prepare feature test folders in tests/unit/public-site/, tests/integration/public-site/, and tests/e2e/public-site/

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 [P] Create landing page content contracts in apps/web/src/features/public-site/contracts.ts
- [ ] T005 [P] Set up public route monitoring and CTA health checks in apps/web/src/features/public-site/telemetry.ts
- [ ] T006 Configure SEO metadata helpers for landing and blog entry in apps/web/src/features/public-site/seo.ts

## Phase 3: User Story 1 - Understand Daily Paper Immediately (Priority: P1)

**Goal**: Communicate product value clearly on landing page.
**Independent Test**: Load root page and verify value proposition, hero hierarchy, and CTA visibility.

### Tests for US1 (write first and confirm failing baseline)

- [ ] T007 [P] [US1] Add contract/integration boundary test in tests/integration/public-site/test-understand-daily-paper-immediately-contracts.spec.ts
- [ ] T008 [P] [US1] Add unit test coverage in tests/unit/public-site/test-understand-daily-paper-immediately.spec.ts
- [ ] T009 [P] [US1] Add end-to-end scenario in tests/e2e/public-site/test-understand-daily-paper-immediately.e2e.ts

### Implementation for US1

- [ ] T010 [P] [US1] Create feature model/types in apps/api/src/features/public-site/understand-daily-paper-immediately.types.ts
- [ ] T011 [US1] Implement service logic in apps/api/src/features/public-site/understand-daily-paper-immediately.service.ts
- [ ] T012 [US1] Implement UI or endpoint integration in apps/web/src/features/public-site/understand-daily-paper-immediately.tsx
- [ ] T013 [US1] Add telemetry/audit hooks in apps/api/src/features/public-site/understand-daily-paper-immediately.telemetry.ts

## Phase 4: User Story 2 - Reach Signup and Login Quickly (Priority: P2)

**Goal**: Provide direct routing to signup, login, and blog entry points.
**Independent Test**: Click primary and secondary actions and verify correct route transitions.

### Tests for US2 (write first and confirm failing baseline)

- [ ] T014 [P] [US2] Add contract/integration boundary test in tests/integration/public-site/test-reach-signup-and-login-quickly-contracts.spec.ts
- [ ] T015 [P] [US2] Add unit test coverage in tests/unit/public-site/test-reach-signup-and-login-quickly.spec.ts
- [ ] T016 [P] [US2] Add end-to-end scenario in tests/e2e/public-site/test-reach-signup-and-login-quickly.e2e.ts

### Implementation for US2

- [ ] T017 [P] [US2] Create feature model/types in apps/api/src/features/public-site/reach-signup-and-login-quickly.types.ts
- [ ] T018 [US2] Implement service logic in apps/api/src/features/public-site/reach-signup-and-login-quickly.service.ts
- [ ] T019 [US2] Implement UI or endpoint integration in apps/web/src/features/public-site/reach-signup-and-login-quickly.tsx
- [ ] T020 [US2] Add telemetry/audit hooks in apps/api/src/features/public-site/reach-signup-and-login-quickly.telemetry.ts

## Phase 5: User Story 3 - Build Trust Before Signup (Priority: P3)

**Goal**: Show trust signals and clearly labeled sample digest preview.
**Independent Test**: Review page copy and labels to verify neutrality, trust links, and sample framing.

### Tests for US3 (write first and confirm failing baseline)

- [ ] T021 [P] [US3] Add contract/integration boundary test in tests/integration/public-site/test-build-trust-before-signup-contracts.spec.ts
- [ ] T022 [P] [US3] Add unit test coverage in tests/unit/public-site/test-build-trust-before-signup.spec.ts
- [ ] T023 [P] [US3] Add end-to-end scenario in tests/e2e/public-site/test-build-trust-before-signup.e2e.ts

### Implementation for US3

- [ ] T024 [P] [US3] Create feature model/types in apps/api/src/features/public-site/build-trust-before-signup.types.ts
- [ ] T025 [US3] Implement service logic in apps/api/src/features/public-site/build-trust-before-signup.service.ts
- [ ] T026 [US3] Implement UI or endpoint integration in apps/web/src/features/public-site/build-trust-before-signup.tsx
- [ ] T027 [US3] Add telemetry/audit hooks in apps/api/src/features/public-site/build-trust-before-signup.telemetry.ts

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T028 [P] Update feature documentation and runbook notes in specs/features/public-site/quickstart.md
- [ ] T029 Run full test suite for this feature and capture results in specs/features/public-site/quickstart.md
- [ ] T030 Verify privacy-safe telemetry and consent/RBAC compliance for this feature in specs/features/public-site/spec.md

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