# Tasks: Blog + SEO Pages

**Input**: Design documents from /specs/features/blog-seo/

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED by constitution and must be authored before implementation tasks in each user story phase.

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Confirm feature scope and dependencies in specs/features/blog-seo/spec.md
- [x] T002 Capture implementation assumptions in specs/features/blog-seo/plan.md
- [x] T003 [P] Prepare feature test folders in tests/unit/blog-seo/, tests/integration/blog-seo/, and tests/e2e/blog-seo/

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T004 [P] Create shared blog content schema validators in apps/api/src/features/blog-seo/schema.ts
- [x] T005 Create blog repository and query adapters in apps/api/src/features/blog-seo/blogRepository.ts
- [x] T006 [P] Set up SEO telemetry and route health probes in apps/web/src/features/blog-seo/telemetry.ts

## Phase 3: User Story 1 - Browse Published Blog Content (Priority: P1)

**Goal**: Render browsable published blog index pages.
**Independent Test**: Open blog index and verify visible published cards and pagination behavior.

### Tests for US1 (write first and confirm failing baseline)

- [x] T007 [P] [US1] Add contract/integration boundary test in tests/integration/blog-seo/test-browse-published-blog-content-contracts.spec.ts
- [x] T008 [P] [US1] Add unit test coverage in tests/unit/blog-seo/test-browse-published-blog-content.spec.ts
- [x] T009 [P] [US1] Add end-to-end scenario in tests/e2e/blog-seo/test-browse-published-blog-content.e2e.ts

### Implementation for US1

- [x] T010 [P] [US1] Create feature model/types in apps/api/src/features/blog-seo/browse-published-blog-content.types.ts
- [x] T011 [US1] Implement service logic in apps/api/src/features/blog-seo/browse-published-blog-content.service.ts
- [x] T012 [US1] Implement UI or endpoint integration in apps/web/src/features/blog-seo/browse-published-blog-content.tsx
- [x] T013 [US1] Add telemetry/audit hooks in apps/api/src/features/blog-seo/browse-published-blog-content.telemetry.ts

## Phase 4: User Story 2 - Read a Blog Post by Slug (Priority: P1)

**Goal**: Serve full post detail by slug route.
**Independent Test**: Open known slug and verify full article content and metadata render.

### Tests for US2 (write first and confirm failing baseline)

- [x] T014 [P] [US2] Add contract/integration boundary test in tests/integration/blog-seo/test-read-a-blog-post-by-slug-contracts.spec.ts
- [x] T015 [P] [US2] Add unit test coverage in tests/unit/blog-seo/test-read-a-blog-post-by-slug.spec.ts
- [x] T016 [P] [US2] Add end-to-end scenario in tests/e2e/blog-seo/test-read-a-blog-post-by-slug.e2e.ts

### Implementation for US2

- [x] T017 [P] [US2] Create feature model/types in apps/api/src/features/blog-seo/read-a-blog-post-by-slug.types.ts
- [x] T018 [US2] Implement service logic in apps/api/src/features/blog-seo/read-a-blog-post-by-slug.service.ts
- [x] T019 [US2] Implement UI or endpoint integration in apps/web/src/features/blog-seo/read-a-blog-post-by-slug.tsx
- [x] T020 [US2] Add telemetry/audit hooks in apps/api/src/features/blog-seo/read-a-blog-post-by-slug.telemetry.ts

## Phase 5: User Story 3 - Discover Content by Topic and Date (Priority: P2)

**Goal**: Support topic/date discovery filters and archives.
**Independent Test**: Apply filters and verify only matching posts are listed.

### Tests for US3 (write first and confirm failing baseline)

- [x] T021 [P] [US3] Add contract/integration boundary test in tests/integration/blog-seo/test-discover-content-by-topic-and-date-contracts.spec.ts
- [x] T022 [P] [US3] Add unit test coverage in tests/unit/blog-seo/test-discover-content-by-topic-and-date.spec.ts
- [x] T023 [P] [US3] Add end-to-end scenario in tests/e2e/blog-seo/test-discover-content-by-topic-and-date.e2e.ts

### Implementation for US3

- [x] T024 [P] [US3] Create feature model/types in apps/api/src/features/blog-seo/discover-content-by-topic-and-date.types.ts
- [x] T025 [US3] Implement service logic in apps/api/src/features/blog-seo/discover-content-by-topic-and-date.service.ts
- [x] T026 [US3] Implement UI or endpoint integration in apps/web/src/features/blog-seo/discover-content-by-topic-and-date.tsx
- [x] T027 [US3] Add telemetry/audit hooks in apps/api/src/features/blog-seo/discover-content-by-topic-and-date.telemetry.ts

## Phase 6: User Story 4 - Search Engine Friendly Blog Surface (Priority: P1)

**Goal**: Expose complete SEO metadata and crawlable links.
**Independent Test**: Check generated metadata and sitemap entries for published posts.

### Tests for US4 (write first and confirm failing baseline)

- [x] T028 [P] [US4] Add contract/integration boundary test in tests/integration/blog-seo/test-search-engine-friendly-blog-surface-contracts.spec.ts
- [x] T029 [P] [US4] Add unit test coverage in tests/unit/blog-seo/test-search-engine-friendly-blog-surface.spec.ts
- [x] T030 [P] [US4] Add end-to-end scenario in tests/e2e/blog-seo/test-search-engine-friendly-blog-surface.e2e.ts

### Implementation for US4

- [ ] T031 [P] [US4] Create feature model/types in apps/api/src/features/blog-seo/search-engine-friendly-blog-surface.types.ts
- [ ] T032 [US4] Implement service logic in apps/api/src/features/blog-seo/search-engine-friendly-blog-surface.service.ts
- [ ] T033 [US4] Implement UI or endpoint integration in apps/web/src/features/blog-seo/search-engine-friendly-blog-surface.tsx
- [ ] T034 [US4] Add telemetry/audit hooks in apps/api/src/features/blog-seo/search-engine-friendly-blog-surface.telemetry.ts

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T035 [P] Update feature documentation and runbook notes in specs/features/blog-seo/quickstart.md
- [ ] T036 Run full test suite for this feature and capture results in specs/features/blog-seo/quickstart.md
- [ ] T037 Verify privacy-safe telemetry and consent/RBAC compliance for this feature in specs/features/blog-seo/spec.md

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