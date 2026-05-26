# Feature Specification: AI Summarization + Ranking (Curation)

**Feature Branch**: `ai-curation`

**Created**: 2026-05-26

**Status**: Draft

**Owner**: POD AI/Content

**Dependencies**:
- Content Processing (`specs/features/content-processing/spec.md`)
- Onboarding + Preferences (`specs/features/onboarding-preferences/spec.md`)

---

## Overview

AI Curation is the pipeline stage that generates concise summaries of processed articles and ranks the resulting story candidates according to each user's declared preferences. It sits between Content Processing (which produces `articles_processed`) and digest assembly (which selects and delivers stories to users).

**Consumes**: `articles_processed` from Content Processing; `preferences` (specifically `topics[]`) from Onboarding + Preferences
**Outputs**: `article_summaries` consumed by digest assembly

The curation pipeline operates under the strict constraints of Daily Paper's Trust principle (Principle III). Every summary must be derived from source metadata only, explicitly labeled as AI-generated, neutral in tone, and traceable to the original article and source. AI assistance is presented as a reading aid, never as editorial judgment or authoritative truth.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Receive a Ranked, Summarized Digest of Relevant Stories (Priority: P1)

As a user with saved topic preferences, I want my digest to present the most relevant stories from each of my chosen topics — each with a short, readable summary — so that I can absorb the day's news quickly without clicking every headline.

**Why this priority**: This is the core value proposition of the AI Curation feature. Without ranked and summarized story candidates, digest assembly cannot deliver a personalized, readable digest. All other stories in this spec exist to support or protect this one.

**Independent Test**: Can be tested independently by running the curation pipeline against a set of `articles_processed` records and a preference fixture containing at least two topics, then verifying that the output story list is ordered by topic match and recency and that each story carries a non-empty summary derived from available article content.

**Acceptance Scenarios**:

1. **Given** a user has saved preferences with topics `["tech", "markets"]`, **When** the curation pipeline runs, **Then** the ranked story list MUST present `tech` and `markets` candidates above unmatched categories.
2. **Given** a set of processed articles is available for a user's selected topics, **When** summarization runs, **Then** each story in the output carries a `summaryText` or non-empty `bulletPoints[]` derived only from the article's `title`, `snippet`, and `sources` fields.
3. **Given** the curation pipeline has run successfully, **When** digest assembly reads the output, **Then** each `article_summaries` record carries the `processedArticleId` and `modelInfo` block for auditability.

---

### User Story 2 — Read Summaries That Are Honest About Their AI Origin (Priority: P1)

As a user, I want to know clearly that a short summary is machine-generated and is not an editorial headline, so I can form my own judgment and click through to the original source.

**Why this priority**: This is a constitutional requirement under Principle III (Trust, Attribution, and Honest AI). Presenting AI-generated copy as authoritative news would violate Daily Paper's trust foundation. AI labeling is non-negotiable and not deferrable to a later phase.

**Independent Test**: Can be tested independently by inspecting any rendered digest item produced by the curation pipeline and confirming it carries a visible "Summary" label and a functioning link to the original article's `canonicalUrl`.

**Acceptance Scenarios**:

1. **Given** a digest item is produced by the curation pipeline, **When** it is rendered in any delivery channel, **Then** it MUST carry a visible "Summary" label and a link to the `canonicalUrl` of the original article.
2. **Given** a user sees a summary in their digest, **When** they follow the attribution link, **Then** they arrive at the original publisher's article, not a rewritten or cached version.
3. **Given** the `modelInfo` field is populated in `article_summaries`, **When** an operator queries the audit store, **Then** they can identify which model name and version produced each summary.

---

### User Story 3 — Receive a Readable Digest Even When AI Summarization Fails (Priority: P1)

As a user, I want to see a story's title and original snippet when the AI summarization service is unavailable or fails for that article, so that my digest is never empty and remains useful even during AI outages.

**Why this priority**: Fallback resilience is essential to user trust and digest reliability. An AI failure must never produce a blank or broken digest. This makes fallback a P1 safety requirement, not an enhancement.

**Independent Test**: Can be tested independently by simulating an AI service failure for a subset of articles and confirming that the curation output for those articles contains the article `title`, original `snippet`, and `canonicalUrl`, with no AI "Summary" label applied.

**Acceptance Scenarios**:

1. **Given** the AI summarization call fails for an article, **When** the curation pipeline processes that article, **Then** the output record MUST include the article `title`, original `snippet`, and `canonicalUrl`  — and MUST NOT carry a "Summary" label.
2. **Given** AI fails for some articles in a batch, **When** the pipeline completes, **Then** affected records MUST be flagged with `fallbackApplied: true` so digest assembly and operators can distinguish AI-generated content from fallback content.
3. **Given** AI summarization is fully unavailable for an entire run, **When** the pipeline completes, **Then** every story in the digest receives the title-plus-snippet fallback and the digest is still delivered on schedule.

---

### User Story 4 — Digest Includes a Controlled Number of Stories Per Category (Priority: P2)

As a user, I want my digest to present a focused selection of top stories per category rather than an overwhelming volume, so that the daily paper remains quick to read.

**Why this priority**: Volume control is a direct expression of the constitutional principle of delivering user value in under 60 seconds. It is P2 because the digest is functional without a cap, but the cap is important for sustained digest quality and user retention.

**Independent Test**: Can be tested independently by running the curation pipeline against a large article set and verifying that no category in the output contains more stories than the configured per-category limit, and that the selected stories are the highest-ranked under the configured criteria.

**Acceptance Scenarios**:

1. **Given** a category has 20 available processed articles, **When** the curation pipeline runs with a per-category limit of 5, **Then** the output for that category contains at most 5 ranked stories.
2. **Given** a per-category limit is set, **When** the pipeline selects candidates, **Then** it selects stories ranked highest by category match, recency, and optional popularity signal — not the first N encountered in iteration order.
3. **Given** the per-category limit is updated in configuration, **When** the pipeline next runs, **Then** the new limit is applied without requiring a redeployment.

---

### User Story 5 — Summaries Are Served From Cache for Repeated Stories (Priority: P3)

As an operator, I want summaries for articles that have already been processed to be retrieved from cache rather than re-generated by the AI model, so that operational costs remain predictable and controlled.

**Why this priority**: Cost control protects the long-term viability of the free-tier product model. Caching is a P3 quality-of-service requirement because the digest is already functional without it, but unbounded AI invocations at scale would be a product viability risk.

**Independent Test**: Can be tested independently by running the pipeline twice for the same set of articles and verifying that the AI model is invoked exactly once per unique `processedArticleId` — and zero times on the second run.

**Acceptance Scenarios**:

1. **Given** an `article_summaries` record already exists for a `processedArticleId`, **When** the same article appears in a subsequent curation run, **Then** the cached summary is returned without issuing a new AI model call.
2. **Given** an article's source content changes and a new `processedArticleId` is issued, **When** the pipeline runs, **Then** a fresh summary is generated and stored with new `modelInfo`.
3. **Given** the cache is populated, **When** an operator inspects the `article_summaries` collection, **Then** each record includes `modelInfo` identifying the model and version that produced the cached result.

---

### Edge Cases

- What happens when a user has no saved preferences? Ranking MUST fall back to recency-only ordering across all categories and MUST NOT attempt preference-matching against an empty or absent preference profile.
- What happens when the AI returns an empty or blank summary? The pipeline MUST treat an empty AI response as a failure and apply the fallback (title + snippet) rather than storing an empty `summaryText` or empty `bulletPoints[]`.
- What happens when a processed article has an empty `snippet`? The pipeline MUST attempt summarization from `title` alone and MUST flag the record so that output quality can be monitored by operators.
- What happens when two articles in the same category share a `dedupGroupId`? The ranking step MUST surface only one representative record per dedup group per category so the same story does not appear twice in the same digest section.
- What happens when the per-category limit is set to zero or an invalid value? The pipeline MUST reject the invalid configuration at startup and alert operators rather than silently producing an empty or unbounded digest.
- What happens when popularity signal data is unavailable? Ranking MUST continue using category match and recency only; popularity is an optional signal and its absence MUST NOT block the pipeline.
- What happens when `modelInfo` cannot be populated (e.g., model metadata is unavailable from the AI service)? The pipeline MUST store an explicit null model name and version rather than fabricating metadata.
- What happens when a generated summary contains sensational, defamatory, or non-neutral language? The pipeline MUST apply tone guardrails at generation time; if output fails guardrails, the pipeline MUST apply the title-plus-snippet fallback rather than storing the rejected summary.
- What happens when the AI service returns a summary that reproduces personally identifiable information? The pipeline MUST discard the response and apply fallback rather than storing untrusted output.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-AI-001**: The system MUST derive all summary content exclusively from the article's `title`, `snippet`, and `sources` fields in `articles_processed`; the pipeline MUST NOT generate or infer content beyond what is present in source metadata.
- **FR-AI-002**: Every `article_summaries` record MUST include source attribution: the source name and the `canonicalUrl` of the original article, traceable to the originating `articles_processed` record.
- **FR-AI-003**: The ranking step MUST prioritize articles whose `categories` include at least one of the user's `topics[]` from their preference profile; within a matched category, recency (`publishedAt` descending) MUST be the primary sort signal.
- **FR-AI-004**: The number of stories selected per category per digest run MUST be configurable via a per-category limit parameter; the default limit MUST align with a target read time of under 60 seconds per Daily Paper's constitutional principle.
- **FR-AI-005**: If AI summarization fails for any article, the pipeline MUST apply a fallback that uses the article's original `title` and `snippet` from `articles_processed`, MUST mark the output record with `fallbackApplied: true`, and MUST NOT silently drop the article from the digest.
- **FR-AI-006**: An existing `article_summaries` record for a `processedArticleId` MUST be returned from cache on subsequent runs; the AI model MUST NOT be re-invoked for unchanged articles.
- **FR-AI-007**: The pipeline MUST record `modelInfo` (model name, model version, invocation timestamp) on every `article_summaries` record generated by AI; records produced via fallback MUST store null for model name, version, and invocation timestamp.
- **FR-AI-008**: AI-generated summaries MUST be limited to 2–4 bullet points or a short paragraph; the pipeline MUST NOT produce open-ended or unstructured long-form summaries in Phase 1.
- **FR-AI-009**: The pipeline MUST accept `articles_processed` as its sole article input source; direct consumption of `articles_raw` is not permitted.
- **FR-AI-010**: The pipeline MUST read user preference profiles from the `preferences` data store to drive ranking; per-user ranking MUST NOT be hardcoded or derived from any source other than declared preferences.
- **FR-AI-011**: The pipeline MUST deduplicate story candidates by `dedupGroupId` before ranking so that the same story does not appear more than once per category in the output.

### Non-Functional Requirements

- **NFR-AI-001**: Summary generation MUST be idempotent: re-running the pipeline for the same set of `articles_processed` records and preferences MUST produce the same ranked story set and MUST NOT create duplicate `article_summaries` records.
- **NFR-AI-002**: The pipeline MUST complete summarization and ranking for a representative daily article batch within the time window available between content processing completion and the scheduled digest delivery time.
- **NFR-AI-003**: AI model invocations MUST be cached at the `processedArticleId` level; the total number of model calls per digest run MUST be bounded by the count of unique, uncached articles in the current batch.

### Security & Privacy Requirements *(mandatory)*

- The pipeline MUST access only the article content fields (`title`, `snippet`, `sources`, `canonicalUrl`, `publishedAt`, `categories`, `dedupGroupId`) from `articles_processed`; it MUST NOT read user personal data from `articles_processed`.
- User preference data read by the ranking step MUST be used only to order and filter story candidates; it MUST NOT be embedded in, appended to, or stored within `article_summaries` records.
- AI model calls MUST NOT include user identifiers, personal data, or behavioral signals in the prompt or request payload; prompts MUST contain only article-derived content metadata.
- `article_summaries` records MUST NOT store any personally identifiable information, user preference data, or behavioral data.
- Write access to `article_summaries` MUST be restricted to the curation pipeline service identity; digest assembly consumers MUST have read-only access.
- Pipeline logs MUST exclude prompt content, raw AI model responses, user preference data, and any API credentials.
- If an AI model returns output that contains apparent personal data, defamatory claims, or content that fails tone guardrails, the pipeline MUST discard the response and apply the title-plus-snippet fallback rather than storing untrusted AI output.
- The curation pipeline MUST enforce the tone guardrail check (neutral, concise, non-sensational) on every AI-generated summary before writing to `article_summaries`; summaries that fail this check MUST be rejected and replaced with fallback content.

### Experience & Content Integrity Requirements *(mandatory for user-facing features)*

- Every AI-generated summary MUST be labeled as "Summary" in any digest rendering context; the label MUST be visually distinct and MUST NOT be suppressible per digest or per user.
- Summary content MUST maintain a neutral, concise, non-sensational tone consistent with Daily Paper's editorial voice (Principle III); content framed as editorial opinion, prediction, or sensationalism MUST be rejected at generation time.
- The original source name and `canonicalUrl` MUST be displayed alongside every summary and fallback item; the attribution link MUST be functional and traceable to the original publisher.
- AI-generated copy MUST NEVER be presented as authoritative news text, original headline text, or editorial judgment.
- Fallback content (title + snippet) MUST be rendered in a manner visually consistent with summarized content except for the absence of the "Summary" label, ensuring no degraded or confusing experience is surfaced to users.
- All content integrity requirements align directly with Daily Paper constitution Principle III: sources must never be misrepresented or fabricated, AI copy must be labeled and neutral, and attribution must always be present and accurate.

### Observability & Telemetry Requirements *(mandatory)*

- The pipeline MUST emit per-run counts for: articles evaluated, summaries generated by AI, summaries served from cache, fallbacks applied, articles skipped due to missing content, and pipeline failures.
- Every AI model invocation MUST be logged with the `processedArticleId`, model name, model version, invocation timestamp, and a success or failure indicator — without including prompt content or article text in the log payload.
- The pipeline MUST log each fallback event with the `processedArticleId` and the failure reason (AI timeout, empty response, guardrail rejection, etc.).
- Operators MUST be able to query the ratio of AI-generated summaries to fallback summaries per run to monitor AI service health.
- Cost telemetry MUST track the number of AI model invocations per run so that cost per digest can be monitored against targets.
- The pipeline MUST surface repeated failure patterns (e.g., consistent guardrail rejections from a specific source) to allow operators to tune prompts or source filters.
- Telemetry MUST be privacy-safe: logs and metrics MUST NOT include user preference data, user identifiers, or article content text.

---

### Key Entities *(include if feature involves data)*

- **Article Processed** *(input, owned by Content Processing)*: The normalized, deduplicated, and categorized article record from `articles_processed`. The curation pipeline's sole article input. Fields consumed: `id`, `canonicalUrl`, `title`, `snippet`, `sources`, `publishedAt`, `categories`, `dedupGroupId`. This entity is read-only from the perspective of this feature.

- **Preference Profile** *(input, owned by Onboarding + Preferences)*: The user's saved preference record from the `preferences` store. The curation pipeline reads only the `topics[]` field to drive ranking. No personal data fields are passed to the AI model.

- **Article Summary** *(output, owned by this feature)*: The AI-generated or fallback summary record for one processed article. Schema:
  ```
  article_summaries {
    id                  // unique identifier for this summary record
    processedArticleId  // foreign key to articles_processed.id
    summaryText         // AI-generated short paragraph summary, or null when bulletPoints[] is used
    bulletPoints[]      // AI-generated bullet list (2–4 items), or empty when summaryText is used
    modelInfo {
      modelName         // AI model identifier, or null if fallback was applied
      modelVersion      // model version or release slug, or null if fallback was applied
      invokedAt         // ISO 8601 timestamp of AI invocation, or null if cached or fallback
    }
    fallbackApplied     // boolean — true when title + snippet was used instead of AI summary
    createdAt           // ISO 8601 — when this record was first created
    updatedAt           // ISO 8601 — when this record was last refreshed or regenerated
  }
  ```

- **Curation Run**: A single execution of the summarization and ranking pipeline. Records the batch size, run timestamp, AI invocation count, cache hit count, fallback count, failure count, and ranked story counts per category for operational review.

- **Ranking Context**: The ephemeral, per-run structure that pairs processed article candidates with a user's `topics[]` to produce an ordered story list. Not persisted to storage; computed at runtime from `articles_processed` and preference data, then discarded after digest assembly reads the ranked output.

---

## Test Plan

- **Unit coverage**:
  - Ranking function: given a set of processed articles and a `topics[]` preference list, verify output is sorted by category match first, then by `publishedAt` descending.
  - Ranking function: given an empty preference profile, verify the pipeline falls back to recency-only ordering across all categories.
  - Per-category limit: given a limit of N and more than N candidates, verify exactly N stories are selected using the ranking criteria rather than insertion order.
  - Dedup group enforcement: given two processed articles sharing the same `dedupGroupId` in the same category, verify only one appears in the ranked output.
  - Cache hit logic: given an existing `article_summaries` record for a `processedArticleId`, verify no AI model call is issued on subsequent runs.
  - Fallback logic: given an AI failure, verify the output carries `title`, `snippet`, `canonicalUrl`, and `fallbackApplied: true`, with no AI summary label and null `modelInfo` fields.
  - `modelInfo` recording: verify null model fields are stored on fallback records and real model metadata is stored on AI-generated records.
  - Guardrail rejection: given an AI response that fails the tone guardrail check, verify fallback is applied and the rejected response is not stored.

- **Integration coverage**:
  - Summary generation with mock AI: given a processed article fixture and a mock AI service responding with a 3-bullet summary, verify the `article_summaries` output contains correctly populated `bulletPoints[]`, `modelInfo`, attribution fields, and no null `summaryText`-vs-`bulletPoints` conflict.
  - End-to-end pipeline: given `articles_processed` records and a preference fixture with two topics, verify the pipeline produces a ranked, summarized output set respecting the per-category limit and category ordering.
  - AI failure injection: given a mock AI that returns a connection error for 30% of articles, verify the pipeline continues processing remaining articles, applies fallback to failed articles, and emits correct per-run failure telemetry.
  - Idempotency: running the pipeline twice for the same input produces the same `article_summaries` record count with zero duplicates.

- **Observability coverage**:
  - Per-run counts (AI-generated, cached, fallback, skipped, failures) are correctly emitted after each run.
  - Model invocation log entries include `processedArticleId`, model name, model version, and invocation timestamp without prompt content or article text.
  - Fallback log entries include `processedArticleId` and failure reason without user data or credentials.

- **Acceptance coverage**:
  - AI failure fallback: digest output includes `title + snippet + canonicalUrl` for failing articles, with `fallbackApplied: true` and no "Summary" label.
  - Source attribution: every digest item (AI-generated or fallback) carries source name and a functional `canonicalUrl` link.
  - Ranked output: for a mixed-category article set and a two-topic preference, articles matching the user's declared topics appear above unmatched categories.
  - Cost control: a repeated pipeline run for the same unchanged article set issues zero new AI model calls.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of `article_summaries` records produced by AI carry a non-null `modelInfo` block including model name, model version, and invocation timestamp.
- **SC-002**: 100% of digest items — whether AI-summarized or fallback — include a source name and a functional link to the original `canonicalUrl`.
- **SC-003**: In a controlled 100% AI failure injection test, 100% of article candidates still appear in the digest output using fallback content, and no content is silently dropped.
- **SC-004**: In a two-topic preference test against a mixed-category article set, at least 90% of the top-ranked stories match one of the user's declared topics.
- **SC-005**: Re-running the pipeline for the same unchanged article batch produces zero additional AI model invocations (100% cache hit rate for unchanged articles).
- **SC-006**: A representative daily digest run completes ranking and summarization within the time window available before the scheduled delivery time.
- **SC-007**: 0% of stored `article_summaries` records contain user personal data, user identifiers, or behavioral signals.
- **SC-008**: In a guardrail rejection test, 100% of AI responses that fail the tone check result in fallback content being stored rather than the rejected summary, with the event logged with the failure reason.

---

## Assumptions

- `articles_processed` records are stable and complete before the curation pipeline reads them; partially-written records are the responsibility of Content Processing to guard against.
- The curation pipeline reads only the `topics[]` field from the preference profile; no additional personal data is consumed from `preferences` or passed to the AI model.
- The AI summarization model is available as an external or internal service callable by the pipeline; the specific model vendor, API contract, and authentication mechanism are implementation decisions not constrained by this spec.
- Phase 1 popularity signal is treated as optional and absent by default; ranking operates on category match and recency when no popularity data is available.
- The per-category story limit will be configured to a small default (3–5 stories per category suggested) during implementation; the exact value is an implementation decision validated against the 60-second read time target.
- `article_summaries` is a separate collection from `articles_processed`; the curation pipeline reads `articles_processed` but MUST NOT modify it.
- Digest assembly is a downstream consumer of `article_summaries` and is responsible for composing the final personalized digest for each user; the curation pipeline produces ranked summary candidates, not a final per-user digest.
- Tone guardrail checks are enforced at generation time within the pipeline; the specific guardrail implementation (rule-based, classifier, or model output filtering) is an engineering decision.
- Reprocessing of summaries when a model is upgraded is an operator-initiated batch action that invalidates cached records and regenerates them; it is not a real-time user-facing operation.
- Write capacity for `article_summaries` is sufficient to handle the article volume produced by Phase 1 content processing; this assumption must be validated before Phase 1 ships.
