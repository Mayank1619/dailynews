# Feature Specification: Content Processing (Dedup + Categorize)

**Feature Branch**: `content-processing`

**Created**: 2026-05-26

**Status**: Draft

**Owner**: POD Content

**Dependencies**: Content Ingestion (`specs/features/content-ingestion/spec.md`)

---

## Overview

Content Processing is the pipeline stage that transforms raw ingested articles (`articles_raw`) into a normalized, deduplicated, and categorized set (`articles_processed`). It is the mandatory step between Content Ingestion and downstream digest generation. Without this stage, digest assembly would see duplicate stories, missing category routing, and inconsistent field shapes.

**Consumes**: `articles_raw` produced by Content Ingestion
**Outputs**: `articles_processed` consumed by digest generation

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deduplicate Stories Across Sources (Priority: P1)

As the system, I want to detect when multiple sources have published the same story and group them under a single processed article so that users receive one clean story rather than repeated coverage.

**Why this priority**: Deduplication is the primary quality gate. Without it, every ingested article flows into digests independently, breaking the one-paper experience and creating a trust problem. It is the non-negotiable precondition for all downstream digest quality.

**Independent Test**: Can be tested independently by ingesting two raw articles with different source IDs but near-identical titles and canonical URLs, running the processor, and verifying that exactly one `articles_processed` record exists with a `dedupGroupId` and both sources listed in its `sources` array.

**Acceptance Scenarios**:

1. **Given** two raw articles from different sources share the same canonical URL, **When** the processing pipeline runs, **Then** the system produces one `articles_processed` record that lists both sources and assigns a shared `dedupGroupId`.
2. **Given** two raw articles have distinct URLs but highly similar titles (same story, different headlines), **When** the pipeline runs similarity scoring, **Then** the system groups them under the same `dedupGroupId` and marks both sources as attribution entries.
3. **Given** two raw articles are clearly unrelated despite similar word count, **When** the pipeline evaluates them, **Then** they are stored as separate processed articles with distinct `dedupGroupId` values.

---

### User Story 2 - Assign Taxonomy Categories to Stories (Priority: P1)

As the system, I want to assign one or more taxonomy categories to each processed article so that digest assembly can route content into the correct digest sections.

**Why this priority**: Without categories, digest generation cannot organize content. Routing logic and user preference matching both depend on accurate category assignment. This is a P1 requirement because uncategorized articles cannot be used in downstream digest sections.

**Independent Test**: Can be tested independently by processing a set of raw articles with clear keyword signals (e.g., "stock market", "election", "crime report") and verifying that each output article carries at least one category from the defined taxonomy.

**Acceptance Scenarios**:

1. **Given** a processed article's title or snippet contains strong keyword signals for a taxonomy category, **When** the categorization rules are applied, **Then** the article's `categories` array includes that category.
2. **Given** a processed article matches signals for more than one taxonomy category, **When** categorization runs, **Then** all matching categories are added to the `categories` array.
3. **Given** a processed article matches no keyword signals, **When** categorization completes, **Then** the article is stored with an empty `categories` array and flagged for manual review rather than silently discarded.
4. **Given** the taxonomy is: `politics`, `markets`, `crime`, `tech`, `sports`, `horoscope`, `local`, **When** any article is categorized, **Then** only values from this controlled list appear in the `categories` array.

---

### User Story 3 - Normalize Article Fields (Priority: P1)

As the system, I want to produce a consistent, normalized field shape for every processed article so that digest generation and search can operate on reliable, clean data.

**Why this priority**: Normalization underpins both deduplication quality and digest rendering correctness. Articles with inconsistent or absent required fields cannot be safely used without introducing trust and attribution failures, which are constitutional violations.

**Independent Test**: Can be tested independently by feeding raw articles with partial or inconsistently formatted fields into the processor and asserting that every output article has a valid `title`, `snippet`, `canonicalUrl`, `publishedAt`, and non-empty `sources` list.

**Acceptance Scenarios**:

1. **Given** a raw article has a title, snippet, and URL, **When** the normalizer runs, **Then** the processed record has trimmed, non-empty `title` and `snippet` fields and a resolved `canonicalUrl`.
2. **Given** a raw article has a missing snippet, **When** the normalizer runs, **Then** the processed record stores an empty string for `snippet` rather than null or an invented value.
3. **Given** a raw article has a `publishedAt` in an inconsistent format, **When** normalization applies, **Then** the output `publishedAt` is stored in a canonical ISO 8601 format.

---

### User Story 4 - Preserve Full Source Attribution (Priority: P1)

As the system, I want every processed article to retain an attribution list of all sources that published the story so that the digest layer can display honest, multi-source attribution in compliance with Daily Paper's trust principles.

**Why this priority**: The Daily Paper constitution mandates that sources are never misrepresented. Multi-source deduplication must not erase attribution — it strengthens it. This requirement is constitutional, not optional.

**Independent Test**: Can be tested independently by deduplicating a story with three source entries and asserting the output `sources` array contains all three `{ sourceId, url }` entries.

**Acceptance Scenarios**:

1. **Given** three raw articles are grouped as the same story, **When** dedup processing completes, **Then** the `sources` array on the processed record contains exactly three entries, each with a `sourceId` and the article's original `url`.
2. **Given** a processed article is updated because a new source publishes the same story later, **When** the pipeline re-runs, **Then** the new source is appended to the existing `sources` list without removing prior entries.

---

### User Story 5 - Idempotent and Pipeline-Version-Tracked Processing (Priority: P2)

As an operator, I want the processing pipeline to be safe to rerun and to record its version against every output record so that we can reprocess the corpus when rules change without creating duplicates or losing confidence in processed data quality.

**Why this priority**: Idempotency and pipeline traceability are required for operational safety and testing fidelity. They allow category rule updates and dedup improvements to be applied to existing content without a full corpus teardown.

**Independent Test**: Can be tested independently by running the same set of raw articles twice and confirming the output count is identical on both runs, with each record carrying the same `processingTimestamp` and `pipelineVersion`.

**Acceptance Scenarios**:

1. **Given** a batch of raw articles has already been processed, **When** the pipeline reruns the same input, **Then** no additional `articles_processed` records are created.
2. **Given** the processing pipeline runs successfully, **When** inspecting any output record, **Then** the record includes a `processingTimestamp` and a `pipelineVersion` field identifying the rule set used.
3. **Given** a pipeline version change is deployed and reprocessing is triggered, **When** the new pipeline runs, **Then** existing processed records are updated with the new `pipelineVersion` and `processingTimestamp` rather than duplicated.

---

### Edge Cases

- What happens when a raw article has no URL? The pipeline must use the `rawHash` from `articles_raw` as the fallback dedup key; if neither is available the article must be flagged as unprocessable and excluded from output.
- What happens when two articles have a URL match but completely different titles? URL canonical match MUST take precedence over title similarity and the articles must be grouped, with the discrepancy logged for review.
- What happens when no keyword signals match any taxonomy category? The article must be stored with an empty `categories` array and surfaced in an operator review queue rather than silently dropped.
- What happens when the same source publishes the same story twice under slightly different URLs? Both raw records must be evaluated for title similarity; if similarity threshold is met they are grouped regardless of URL difference.
- What happens when `scoreSignals` is absent? The field is optional and MUST be omitted rather than stored as null; its absence MUST NOT block dedup or categorization.
- What happens when processing runs during active ingestion? The pipeline must operate on a stable snapshot or handle partially-written states gracefully by skipping incomplete raw records rather than failing the entire run.
- What happens when a processed record's `sources` list grows very large due to viral news? The system must continue appending without truncating attribution entries; capacity limits MUST be defined before Phase 1 ships.
- What happens when the pipeline version changes and old processed records exist? Records must remain usable by downstream consumers until a deliberate reprocessing run updates them.
- What happens when two articles exceed similarity threshold but belong to different topic domains (e.g., two unrelated articles both titled "Major Announcement")? Category-scoped similarity checks SHOULD be used as a tie-breaker in ambiguous cases; false positives must be logged.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-PROC-001**: The system MUST deduplicate raw articles using canonical URL as the primary key; when URLs do not match, title similarity scoring MUST be applied as a secondary signal.
- **FR-PROC-002**: The system MUST assign a `dedupGroupId` to every processed article; articles grouped as the same story MUST share a single `dedupGroupId`.
- **FR-PROC-003**: The system MUST assign categories from the controlled taxonomy (`politics`, `markets`, `crime`, `tech`, `sports`, `horoscope`, `local`) using keyword-based rules in Phase 1.
- **FR-PROC-004**: The system MUST preserve the full `sources` attribution list on every processed article, retaining `{ sourceId, url }` for every raw source that contributed to the story.
- **FR-PROC-005**: The system MUST store a `processingTimestamp` and `pipelineVersion` on every output record.
- **FR-PROC-006**: The system MUST normalize `title` and `snippet` fields to trimmed, non-null strings on every processed record.
- **FR-PROC-007**: The system MUST resolve and store a `canonicalUrl` for every processed article, derived from the highest-confidence source URL in the dedup group.
- **FR-PROC-008**: The system MUST store a `publishedAt` value in ISO 8601 format on every processed record, using the earliest `publishedAt` from the dedup group when multiple sources are merged.
- **FR-PROC-009**: The system MUST store processed articles in the `articles_processed` collection using the data model defined in the Key Entities section.
- **FR-PROC-010**: The system MUST accept `articles_raw` records produced by the Content Ingestion pipeline as its sole input source.
- **FR-PROC-011**: Processing MUST be idempotent so that rerunning the same input set produces the same output set without creating duplicate `articles_processed` records.
- **FR-PROC-012**: The system MUST continue processing remaining raw articles when one article fails validation or normalization, and MUST log the failure with enough detail for diagnosis.
- **FR-PROC-013**: Articles that match no taxonomy categories MUST be stored with an empty `categories` array and flagged for operator review.
- **FR-PROC-014**: The system MUST expose the processed article output to downstream digest generation through the `articles_processed` collection; no direct coupling to raw ingestion records is permitted.
- **FR-PROC-015**: The pipeline MUST support reprocessing of existing `articles_raw` records when category rules or dedup logic is updated, updating `articles_processed` in place rather than creating duplicates.

### Non-Functional Requirements

- **NFR-PROC-001**: Processing MUST be idempotent so that repeated execution with the same input produces the same output set and record count.
- **NFR-PROC-002**: Similarity scoring MUST use a deterministic algorithm so that identical input always produces identical grouping results regardless of run order.
- **NFR-PROC-003**: Category rule updates MUST be deployable without a full pipeline restart or corpus deletion.
- **NFR-PROC-004**: The pipeline MUST complete a representative batch of 1,000 raw articles within a time window acceptable for the 30–60 minute digest assembly window defined by phase 1 ingestion cadence.

### Security & Privacy Requirements *(mandatory)*

- The processing pipeline MUST consume only data already ingested and approved through the Content Ingestion pipeline; no new data sources may be introduced at this stage.
- Processed article records MUST contain only content metadata and source attribution; no user personal data or behavioral signals may be stored in `articles_processed`.
- Pipeline logs MUST exclude secrets, API credentials, and any personally identifiable information.
- Similarity scores and intermediate computation states MUST NOT be written to persistent storage unless they are the `scoreSignals` field explicitly defined in the data model.
- Write access to `articles_processed` MUST be restricted to the processing pipeline service identity; digest generation consumers MUST have read-only access.
- Any reprocessing operation that modifies existing records MUST be authorized by an operator and auditable.
- The pipeline MUST not alter or rewrite source attribution fields; `sources` entries must reflect actual ingestion provenance.

### Experience & Content Integrity Requirements *(mandatory for user-facing features)*

- Processed articles MUST preserve the original source name and source URL in the `sources` list so that any digest surface built on `articles_processed` can render honest multi-source attribution.
- The pipeline MUST NOT rewrite, embellish, or editorialize `title` or `snippet` fields; normalization is limited to trimming, encoding correction, and format standardization.
- Content integrity aligns with Daily Paper constitution principle III (Trust, Attribution, and Honest AI): sources may never be misrepresented, and AI-assisted categorization MUST label its method clearly if surfaced in admin tooling.
- The `categories` field MUST use only values from the defined controlled taxonomy list; no free-text or model-generated labels may be stored in Phase 1.

### Observability & Telemetry Requirements *(mandatory)*

- The pipeline MUST emit per-run counts for: raw articles ingested, articles normalized, dedup groups created, articles merged into existing groups, articles stored as new, categorization assignments by category, articles with no category match, and processing failures.
- The pipeline MUST log each failure with the raw article ID, failure reason, and pipeline stage where the failure occurred.
- The pipeline MUST record the `pipelineVersion` and `processingTimestamp` on every output record as a built-in audit trail.
- Operators MUST be able to query the number of articles in each taxonomy category to detect systematic categorization failures.
- Telemetry MUST be privacy-safe and MUST NOT include article content text, source credentials, or any user behavioral data.
- The pipeline MUST surface repeated failure patterns by category or source so operations can identify broken rules or broken sources quickly.

### Key Entities *(include if feature involves data)*

- **Article Raw** *(input, owned by Content Ingestion)*: The source record produced by ingestion; includes `id`, `sourceId`, `title`, `url`, `publishedAt`, optional `author`, optional `snippet`, `fetchedAt`, and `rawHash`. This entity is read-only from the perspective of this feature.

- **Article Processed** *(output, owned by this feature)*: The normalized, deduplicated, and categorized result ready for digest generation. Schema:
  ```
  articles_processed {
    id                  // unique identifier for the processed story
    canonicalUrl        // resolved canonical URL for the story (highest-confidence source URL)
    title               // normalized, trimmed title
    snippet             // normalized, trimmed snippet (empty string if absent in all sources)
    sources             // [{ sourceId, url }] — full attribution list, one entry per contributing raw article
    publishedAt         // ISO 8601 — earliest publishedAt across grouped sources
    categories          // string[] — values constrained to controlled taxonomy
    dedupGroupId        // identifier linking all processed records that share the same story
    processingTimestamp // ISO 8601 — when this record was last written by the pipeline
    pipelineVersion     // semver or slug — identifies category rules and dedup algorithm version used
    scoreSignals?       // optional object — reserved for future ranking signals; MUST NOT block processing if absent
  }
  ```

- **Dedup Group**: A logical grouping of one or more raw article records that the pipeline has determined represent the same real-world story. Identified by `dedupGroupId`. In Phase 1, groups are formed by canonical URL match first, then title similarity threshold.

- **Processing Run**: A single execution of the processing pipeline. Records the batch size, run timestamp, pipeline version, per-category counts, failure count, and new vs. updated record counts for operational review.

- **Category Rule Set**: The versioned set of keyword-to-taxonomy mappings used to assign `categories`. Coupled to `pipelineVersion` so that changes to rules are attributable to specific output records. In Phase 1, rules are keyword-based only.

---

## Test Plan

- **Unit coverage**:
  - Title similarity scoring returns correct match/no-match decisions for representative pairs including edge cases (exact match, partial match, unrelated).
  - URL normalization and canonical URL resolution produce expected output for common URL variants (trailing slash, query params, http vs https).
  - Category keyword rule matching assigns correct taxonomy values and handles multi-category articles.
  - Normalization trims whitespace, handles missing `snippet`, and formats `publishedAt` to ISO 8601.
  - Idempotency: processing the same raw article twice produces exactly one `articles_processed` record.

- **Integration coverage**:
  - Processing pipeline reads `articles_raw`, applies dedup and categorization, and writes correctly shaped `articles_processed` records.
  - A two-source story produces one processed record with a `sources` array of length two and a shared `dedupGroupId`.
  - A pipeline failure on one raw article does not prevent the remaining batch from completing.
  - Reprocessing with an updated `pipelineVersion` updates existing records in place without duplication.

- **Observability coverage**:
  - Per-run counts (normalized, merged, new, categorized by taxonomy, failures) are emitted after each run.
  - Failure logs include raw article ID, pipeline stage, and reason without including credentials or user data.

- **Acceptance coverage**:
  - Two sources publish same story → one processed story with multiple sources in the `sources` list.
  - Categorization rules correctly assign `politics`, `markets`, `crime`, `tech`, `sports`, `horoscope`, and `local` for representative articles in each category.
  - An article with no category match is stored with an empty `categories` array and is queryable as requiring review.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A representative acceptance test of two sources publishing the same story results in exactly one `articles_processed` record carrying both sources in the `sources` list and a shared `dedupGroupId`.
- **SC-002**: 100% of `articles_processed` records in a validation batch include non-empty `title`, `canonicalUrl`, at least one `sources` entry, `processingTimestamp`, and `pipelineVersion`.
- **SC-003**: Category assignment accuracy across a labeled test set of 50 representative articles meets or exceeds 80% correct primary category assignment using Phase 1 keyword rules.
- **SC-004**: Re-running the same input batch of raw articles produces 0 additional `articles_processed` records (idempotency guarantee).
- **SC-005**: In a failure injection test, at least 95% of valid raw articles in a mixed-failure batch complete processing successfully when one or more articles are malformed.
- **SC-006**: Every `articles_processed` record in validation carries a `pipelineVersion` value that matches the deployed rule set version at the time of processing.

---

## Assumptions

- `articles_raw` records are considered stable and complete at the time the processing pipeline reads them; partially-written ingestion records are the responsibility of the Content Ingestion pipeline to guard against.
- Phase 1 category assignment relies exclusively on keyword-based rules; ML-based or embedding-based classification is out of scope for Phase 1.
- The controlled taxonomy (`politics`, `markets`, `crime`, `tech`, `sports`, `horoscope`, `local`) is fixed for Phase 1; taxonomy extension requires a `pipelineVersion` bump and reprocessing.
- `scoreSignals` is reserved for future ranking use (Phase 2+) and is treated as fully optional; its absence does not degrade any Phase 1 functionality.
- Similarity thresholds for title-based deduplication will be tuned during implementation using a representative article sample; the exact threshold value is an implementation decision, not a spec constraint.
- Downstream digest generation consumers will read exclusively from `articles_processed` and MUST NOT depend on `articles_raw` directly.
- Write capacity limits on `articles_processed` are sufficient to handle the article volume produced by Phase 1 ingestion cadence; this assumption must be validated before Phase 1 ships.
- Reprocessing operations are considered infrequent operator-initiated actions, not real-time user-facing operations.
