# Feature Specification: Content Sources + Ingestion (RSS/API)

**Feature Branch**: `[content-ingestion]`

**Created**: 2026-05-26

**Status**: Draft

**Input**: User description: "Feature: Content Sources + Ingestion (RSS/API). Status: Draft. Owner: POD Content. Dependencies: Admin Dashboard (sources), Scheduler/Worker. Goal: Fetch news articles from free-first sources (RSS/API) on a schedule. User story: As the system, I want to ingest articles regularly so newsletters can be generated daily. Scope (Phase 1): store sources list (RSS feeds + optional free API), scheduled ingestion job every 30–60 min, store article metadata in Firestore, basic failure handling + logs. Data model: sources { id, name, type(RSS|API), url, enabled, categoryHint?, createdAt }; articles_raw { id, sourceId, title, url, publishedAt, author?, snippet?, fetchedAt, rawHash }. Functional requirements: FR-ING-001 ingest enabled sources only; FR-ING-002 store article metadata with source attribution; FR-ING-003 avoid duplicate storage via URL/hash check; FR-ING-004 log ingestion results (success/failure counts); FR-ING-005 failures do not break the pipeline. Non-functional: NFR-ING-001 idempotent ingestion; NFR-ING-002 respect source rate limits. Interfaces: Worker job ingestSources(); Admin-managed sources (enable/disable). Acceptance criteria: ingest enabled RSS feed -> new articles stored with source attribution; disabled feed not ingested -> no articles fetched from that source. Tests: Unit RSS parsing and dedup logic; Integration ingestion writes to Firestore."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Approved Sources (Priority: P1)

As POD Content, I want to enable or disable approved RSS feeds and free API sources so that only vetted sources are eligible for ingestion.

**Why this priority**: Source governance is the foundation of trustworthy ingestion. If the source list is not controlled, the rest of the pipeline cannot reliably meet attribution, privacy, and quality expectations.

**Independent Test**: Can be tested independently by creating a source, toggling its enabled state, and verifying that only enabled sources are considered by the ingestion job.

**Acceptance Scenarios**:

1. **Given** a source is stored with `enabled = true`, **When** the ingestion job runs, **Then** the source is eligible for fetch.
2. **Given** a source is stored with `enabled = false`, **When** the ingestion job runs, **Then** no articles are fetched from that source.

---

### User Story 2 - Ingest Articles on Schedule (Priority: P1)

As the system, I want to fetch articles from enabled sources on a regular schedule so that the newsletter pipeline has fresh content to work with every day.

**Why this priority**: Regular ingestion is the core value of the feature. Without scheduled fetching, no downstream newsletter generation can happen on time.

**Independent Test**: Can be tested independently by running the ingestion job on its schedule and confirming that enabled RSS/API sources are fetched without requiring other feature slices.

**Acceptance Scenarios**:

1. **Given** enabled RSS sources exist, **When** the scheduled job runs, **Then** new article metadata is collected for sources that return valid items.
2. **Given** the job is triggered again within the allowed cadence, **When** it reruns, **Then** previously ingested articles are not stored a second time.

---

### User Story 3 - Preserve Attribution and Avoid Duplicates (Priority: P2)

As POD Content, I want every stored article to retain its source attribution and be deduplicated so that the article corpus stays trustworthy and clean.

**Why this priority**: Daily Paper’s trust standard requires clear attribution, and deduplication prevents repeated content from degrading newsletter quality.

**Independent Test**: Can be tested independently by feeding the same article more than once and verifying that only one stored record remains with the correct source attribution.

**Acceptance Scenarios**:

1. **Given** an article is fetched from a source, **When** it is stored, **Then** the record includes the source reference, title, URL, publish time when available, and fetch time.
2. **Given** the same article is encountered again with the same canonical URL or raw hash, **When** the ingestion job processes it, **Then** the system skips creating a duplicate record.

---

### User Story 4 - Continue Through Partial Failures (Priority: P2)

As an operator, I want ingestion failures to be isolated and logged so that one bad source does not stop the rest of the pipeline.

**Why this priority**: Partial failures are expected in source-based ingestion. The feature must keep working for healthy sources even when one source is unavailable or malformed.

**Independent Test**: Can be tested independently by forcing one source to fail while keeping other sources healthy, then confirming the healthy sources still complete and the failure is recorded.

**Acceptance Scenarios**:

1. **Given** one enabled source returns an error, **When** the job runs, **Then** the job continues processing remaining enabled sources.
2. **Given** a source times out or returns malformed content, **When** the job completes, **Then** the failure is logged with enough detail to diagnose the issue later.

### Edge Cases

- What happens when a source is disabled after being scheduled but before fetch begins? The job must treat the source as ineligible and skip it.
- What happens when a feed or API returns the same article multiple times across runs? The system must store only one raw article record for the same canonical article.
- What happens when a source item is missing optional metadata such as author or snippet? The article may still be stored if the required metadata is present, and missing optional fields must be left blank rather than invented.
- What happens when a source response is slow, unavailable, or rate-limited? The system must record the failure and continue with other sources.
- What happens when an item has no stable URL or the URL changes formatting? Deduplication must still rely on the best available canonical identity, including raw hash where needed.
- What happens when the scheduled job reruns after a partial outage? The rerun must be safe and must not create duplicate article records.
- What happens when a free API requires an access credential? The credential must remain outside article records and logs, and the source should only be enabled when the credential is valid and approved.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-ING-001**: The system MUST ingest articles only from sources marked as enabled.
- **FR-ING-002**: The system MUST store each ingested article with source attribution so the original source remains identifiable.
- **FR-ING-003**: The system MUST prevent duplicate raw article storage by checking canonical URL and raw hash before creating a record.
- **FR-ING-004**: The system MUST record ingestion results for each run, including success counts, failure counts, skipped duplicates, and per-source outcomes.
- **FR-ING-005**: The system MUST continue processing remaining enabled sources when one source fails.
- **FR-ING-006**: The system MUST provide an admin-managed source list with the attributes `id`, `name`, `type`, `url`, `enabled`, optional `categoryHint`, and `createdAt`.
- **FR-ING-007**: The system MUST support source types for RSS and optional free API ingestion.
- **FR-ING-008**: The system MUST run ingestion on a recurring schedule within the 30–60 minute window defined for Phase 1.
- **FR-ING-009**: The system MUST persist article metadata in Firestore using the `articles_raw` shape with `id`, `sourceId`, `title`, `url`, `publishedAt`, optional `author`, optional `snippet`, `fetchedAt`, and `rawHash`.
- **FR-ING-010**: The system MUST make ingestion safe to rerun without creating duplicate article records.
- **FR-ING-011**: The system MUST respect source rate limits and avoid unnecessary repeated requests to the same source.
- **FR-ING-012**: The worker job interface MUST expose `ingestSources()` as the ingestion entry point.

### Non-Functional Requirements

- **NFR-ING-001**: Ingestion MUST be idempotent so that repeated execution with the same inputs produces the same stored result set.
- **NFR-ING-002**: Ingestion MUST respect source rate limits and source availability so that free-first providers are not overloaded by the product.

### Security & Privacy Requirements *(mandatory)*

- The feature MUST collect and retain only source and article metadata required for newsletter preparation.
- The feature MUST not store user personal data as part of source ingestion.
- Source configuration changes MUST be restricted to authorized admin users and MUST be auditable.
- Logs MUST exclude secrets, private credentials, and any sensitive content that is not required for troubleshooting.
- If a source uses a credentialed free API, the credential MUST not appear in stored article records, error messages, or operational logs.
- The feature MUST preserve public-source attribution and MUST not imply that content was authored or verified by Daily Paper.

### Experience & Content Integrity Requirements *(mandatory for user-facing features)*

- Stored content MUST preserve source identity so downstream newsletter generation can show honest attribution.
- The system MUST treat source name and original URL as first-class fields rather than optional afterthoughts.
- Imported article metadata MUST remain neutral and factual; the ingestion layer MUST not embellish or rewrite source facts.
- Any downstream content built from these records MUST be able to distinguish source data from Daily Paper-authored copy.
- The design and quality posture MUST align with the Daily Paper constitution: trustworthy, attributable, privacy-conscious, and resistant to misleading content handling.

### Observability & Telemetry Requirements *(mandatory)*

- The feature MUST emit per-run ingestion counts for processed sources, stored articles, duplicates skipped, and failures.
- The feature MUST log source-level outcomes with enough context to identify which source succeeded or failed.
- The feature MUST record the time of the run and the time of the last successful fetch per source when available.
- The feature MUST surface repeated failure patterns so operations can identify broken sources quickly.
- Telemetry MUST remain privacy-safe and MUST not track end-user behavior, hidden personalization, or unnecessary content detail.

### Key Entities *(include if feature involves data)*

- **Source**: An approved feed or API endpoint that can be enabled or disabled for ingestion; includes `id`, `name`, `type`, `url`, `enabled`, optional `categoryHint`, and `createdAt`.
- **Article Raw**: A stored article metadata record produced by ingestion; includes `id`, `sourceId`, `title`, `url`, `publishedAt`, optional `author`, optional `snippet`, `fetchedAt`, and `rawHash`.
- **Ingestion Run**: A scheduled execution of the ingestion process that records outcomes, counts, and failures for operational review.
- **Source Outcome**: The per-source success or failure result captured during a run for troubleshooting and auditability.

## Test Plan

- **Unit coverage**: Validate RSS parsing, API response normalization where applicable, enabled-source filtering, canonical URL handling, and duplicate detection by URL or raw hash.
- **Integration coverage**: Validate that the ingestion job writes article metadata to Firestore, skips disabled sources, and continues when one source fails.
- **Resilience coverage**: Validate that rerunning the same input set does not create duplicate records and that partial failures still produce a completed run record.
- **Observability coverage**: Validate that logs and run summaries include success counts, failure counts, duplicate skips, and source-level outcomes without secrets.
- **Acceptance coverage**: Validate the two core scenarios: enabled RSS feed ingestion stores attributed articles, and disabled feeds are not ingested.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of ingestion runs process only sources marked enabled at run time.
- **SC-002**: 100% of stored articles in a representative acceptance sample include source attribution and a source URL.
- **SC-003**: Re-running the same source input set produces 0 duplicate raw article records in validation tests.
- **SC-004**: In failure testing, at least 1 healthy source continues through completion when 1 source fails.
- **SC-005**: Operators can identify the success count, failure count, and skipped duplicate count for a completed run within 1 minute of job completion.
- **SC-006**: 95% of scheduled runs complete within the intended 30–60 minute cadence window without manual intervention.

## Assumptions

- POD Content curates the source list through the Admin Dashboard, and that dashboard is the authoritative place to enable or disable sources.
- The phase 1 scope stores article metadata only; full article bodies, summaries, and newsletter generation are downstream features.
- The source list contains free-first public RSS feeds and may include optional free APIs that do not require paid access.
- The scheduled worker and storage layer already exist or will be delivered as adjacent infrastructure work.
- Firestore is the intended persistence boundary for the `sources` and `articles_raw` records in phase 1.
- Source ingestion operates on public content only and does not require user consent because it does not collect end-user personal data.
- Missing optional article fields are acceptable as long as attribution and canonical identity can still be preserved.
- The first scheduled interval may be configured anywhere inside the 30–60 minute operating window as long as it remains consistent and testable.
