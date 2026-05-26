# Feature Specification: Newsletter Generation (HTML/Text)

**Feature Branch**: `newsletter-generation`

**Created**: 2026-05-26

**Status**: Draft

**Owner**: POD Delivery

**Dependencies**:
- AI Curation (`specs/features/ai-curation/spec.md`)
- Onboarding + Preferences (`specs/features/onboarding-preferences/spec.md`)
- Design System (`specs/features/design-system/spec.md`)

---

## Overview

Newsletter Generation is the delivery pipeline that assembles and persists a personalized Daily Paper
email for every opted-in user, once per day. It sits at the end of the digest assembly chain: it
consumes the ranked `article_summaries` produced by AI Curation and the saved `preferences` record
from Onboarding + Preferences, then produces two renditions — an HTML email and a plain-text
fallback — grouped by the user's declared topics.

**Consumes**:
- `article_summaries` from AI Curation (ranked, attributed story candidates per topic)
- `preferences` from Onboarding + Preferences (`topics[]`, `region`, `deliveryTime`, `newsletterEnabled`)

**Outputs**: `newsletters` records (HTML rendition, text rendition, article refs, delivery status)
consumed by the Delivery Sending pipeline (out of scope for Phase 1).

The feature operates under all five Daily Paper constitutional principles. Personalization is driven
exclusively by declared preferences (Principle II). Every story carries source attribution and an
honest AI summary label (Principle III). Users who have not opted in, or who have set
`newsletterEnabled: false`, are strictly excluded from generation (Principle IV). Generation ships in
a verifiable, tested slice with observability from day one (Principle V).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Receive a Personalized Daily Paper in My Inbox (Priority: P1)

As an opted-in user with declared topic preferences, I want a daily email that groups today's top
stories by the topics I care about, so I can scan the day's news in under 60 seconds without
visiting a separate app.

**Why this priority**: This is the entire purpose of the feature. Without a correctly assembled,
readable newsletter per user, no other story in the spec has value to deliver.

**Independent Test**: Can be fully tested by running newsletter generation for a single user fixture
containing at least two topic preferences and a set of `article_summaries` records for those topics,
then confirming the resulting `newsletters` record contains a populated `html` rendition with at
least two distinct topic sections, a matching `text` rendition, a correct subject line, and the
user's unsubscribe and preferences links.

**Acceptance Scenarios**:

1. **Given** a user has `preferences.topics = ["stocks", "politics"]` and `newsletterEnabled: true`,
   **When** generation runs for date D, **Then** the newsletter MUST contain a `Stocks` section and
   a `Politics` section, each with stories ranked by AI Curation for that topic.
2. **Given** generation completes successfully, **When** the newsletter record is inspected,
   **Then** `status` MUST be `generated`, `html` and `text` MUST be non-empty, and `articleRefs[]`
   MUST list every article included in the digest.
3. **Given** a user's `article_summaries` contains AI-generated summaries and fallback summaries,
   **When** the newsletter is rendered, **Then** AI-generated items MUST carry a visible "Summary"
   label and fallback items MUST carry no such label.

---

### User Story 2 — My Newsletter Respects My Consent Choice (Priority: P1)

As a user who has set `newsletterEnabled: false`, I want the system to skip newsletter generation
entirely for me, so I never receive emails I did not ask for.

**Why this priority**: Consent gating is a constitutional requirement under Principle IV (Privacy and
Consent by Design). Generating or sending newsletters to opted-out users is a compliance violation,
not a backlog item.

**Independent Test**: Can be fully tested by running the generation pipeline for a user fixture where
`newsletterEnabled: false` and verifying that no `newsletters` record is created for that user for
the target date, and no generation pipeline activity is logged against that user's identity.

**Acceptance Scenarios**:

1. **Given** a user has `newsletterEnabled: false`, **When** the generation pipeline runs for date D,
   **Then** no `newsletters` record is created for that user and the pipeline skips them without error.
2. **Given** a user re-enables delivery by setting `newsletterEnabled: true`, **When** the next
   generation run executes, **Then** a newsletter is generated for that user using their current
   saved preferences.
3. **Given** a user has no saved preferences at all, **When** the generation pipeline evaluates them,
   **Then** generation is skipped and the skip is logged for operational visibility.

---

### User Story 3 — Read Clearly Attributed Stories With an Honest AI Label (Priority: P1)

As a user reading my newsletter, I want each story to show the publication name and a link to the
original article, and I want to know clearly when a short summary was machine-generated, so I can
trust the digest and form my own judgment.

**Why this priority**: Source attribution and AI labeling are non-negotiable under Principle III
(Trust, Attribution, and Honest AI). This is a constitutional requirement and MUST NOT be deferred.

**Independent Test**: Can be fully tested by inspecting a rendered newsletter for a user fixture and
verifying that every story item carries a source name, a working `canonicalUrl` link, a publication
timestamp, and — for AI-summarized items — a "Summary" label.

**Acceptance Scenarios**:

1. **Given** a newsletter is generated, **When** a story item is rendered in HTML,
   **Then** it MUST display the source name, publication date, article title, and a link to the
   original `canonicalUrl`, derived from the `article_summaries` record.
2. **Given** an `article_summaries` record has `fallbackApplied: false` (AI summary present),
   **When** the story is rendered, **Then** a visible, clearly labeled "Summary" marker MUST appear
   adjacent to the summary text in both HTML and text renditions.
3. **Given** an `article_summaries` record has `fallbackApplied: true` (fallback content),
   **When** the story is rendered, **Then** no "Summary" label appears and the `title` + `snippet`
   is presented without AI attribution.

---

### User Story 4 — Unsubscribe or Update Preferences From Inside the Email (Priority: P1)

As a user reading my newsletter, I want a clearly visible unsubscribe link and a link back to my
preferences so that I can always control my delivery without logging in to a separate page first.

**Why this priority**: Unsubscribe access inside every delivered email is a legal requirement under
CAN-SPAM / CASL and a direct expression of Principle IV. It is P1 and MUST be present in every
newsletter record from the first phase.

**Independent Test**: Can be fully tested by inspecting any generated `html` and `text` rendition
and verifying the unsubscribe URL and preferences URL are present, non-empty, and routed to the
correct destinations in both renditions.

**Acceptance Scenarios**:

1. **Given** a newsletter record is generated, **When** the HTML rendition is inspected,
   **Then** it MUST contain a functional unsubscribe link and a preferences link in the footer
   of every email, in both the HTML and plain-text renditions.
2. **Given** a user follows the unsubscribe link, **When** they confirm the action,
   **Then** `preferences.newsletterEnabled` MUST be set to `false` and no further newsletters
   are generated for that user.
3. **Given** a user follows the preferences link, **When** they are directed to the target page,
   **Then** they arrive at the Daily Paper preferences screen (authenticated destination) where they
   can update topics, region, or delivery time.

---

### User Story 5 — Receive a Readable Email on Any Device (Priority: P2)

As a user reading my newsletter on a mobile device, I want the layout to be single-column,
well-spaced, and easy to scan, so that the reading experience is as good as on desktop.

**Why this priority**: Mobile-first rendering is required by the Daily Paper Design System
(Principle I — under 60-second value delivery), but the newsletter record itself is correct without
it. It is P2 because the content is functional even without pixel-perfect mobile layout.

**Independent Test**: Can be fully tested by rendering the generated HTML rendition in a standard
email client preview at 375px and 768px widths and verifying that all story sections, topic
headings, article titles, source attributions, and the footer unsubscribe link remain readable and
not clipped.

**Acceptance Scenarios**:

1. **Given** the HTML rendition is opened on a narrow viewport (375px), **When** the layout renders,
   **Then** all sections stack vertically, no horizontal scrolling is required, and all body text
   meets WCAG AA contrast ratios against the background.
2. **Given** the HTML template uses the Design System's color tokens and typography scale,
   **When** the email is displayed, **Then** headings use the serif treatment and body text uses
   the sans-serif treatment consistent with Daily Paper's content-first identity.

---

### User Story 6 — Blog Highlight Appears When Available (Priority: P3)

As a user, I want to see a featured blog post or editorial highlight at the end of my newsletter
when one is available, so that I occasionally discover longer-form Daily Paper content.

**Why this priority**: This is an optional enrichment section in Phase 1. Blog highlights add value
when content is available but the core digest is fully functional without them.

**Independent Test**: Can be fully tested by running generation with a blog-highlight input provided
and without one provided, and verifying that the section appears only when content is available,
and its absence never breaks the overall newsletter structure.

**Acceptance Scenarios**:

1. **Given** a blog highlight record is available for date D, **When** the newsletter is generated,
   **Then** a "From the Blog" section appears after the topic sections with a title, a brief excerpt,
   and a link to the full post.
2. **Given** no blog highlight is available for date D, **When** the newsletter is generated,
   **Then** the "From the Blog" section is omitted entirely and the newsletter footer follows
   directly after the last topic section without a gap or broken placeholder.

---

### Edge Cases

- What happens when a user has saved preferences but no `article_summaries` exist for any of their
  topics on date D? Generation MUST proceed with an empty-topics fallback that surfaces a "No
  stories available today" message in each topic section rather than skipping generation entirely.
- What happens when the HTML template renders but `text` generation fails? The newsletter MUST NOT be
  marked `generated` unless both renditions are present; it MUST be marked `failed` and logged.
- What happens when `articleRefs[]` would contain a duplicate due to the same article appearing in
  two topic sections? The template MUST deduplicate `articleRefs[]` so each article `id` appears
  at most once, even if the story appears in multiple topic sections.
- What happens when a user's preferences change on the same day a newsletter is already generated?
  Regeneration on preference change is out of scope for Phase 1; the existing record for date D
  MUST NOT be overwritten by a mid-day preference update.
- What happens when the newsletter record already exists with `status: generated` for the same
  `userId` and `date`? The pipeline MUST skip re-generation and treat the existing record as
  authoritative; idempotent re-runs MUST NOT produce a second record.
- What happens when the unsubscribe URL or preferences URL cannot be constructed (e.g., base URL is
  missing from configuration)? Generation MUST fail with `status: failed` rather than emit a
  newsletter with a broken or absent legal link.
- What happens when the subject line contains special characters from a non-ASCII date format?
  The subject MUST be encoded for safe display in all major email clients without relying on the
  rendering environment to handle unencoded characters.
- What happens when AI Curation has not yet produced `article_summaries` for date D when the
  generation pipeline is triggered? The pipeline MUST wait or retry within its scheduled window;
  if summaries are not available before the deadline, generation MUST record `status: failed` and
  alert operators.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-NL-001**: The system MUST generate one newsletter record per opted-in user per calendar day
  (date D), consuming that user's ranked `article_summaries` and `preferences` as inputs.
- **FR-NL-002**: Every newsletter MUST use the subject line format `Your Daily Paper – [Date]`
  where `[Date]` is the human-readable date matching the user's local date for delivery day D
  (e.g., `Your Daily Paper – Monday, May 26`).
- **FR-NL-003**: Each story in the newsletter MUST include the article title, summary or snippet,
  source name, publication date, and a link to the original `canonicalUrl`, sourced from the
  corresponding `article_summaries` record.
- **FR-NL-004**: Every newsletter MUST include, in both the HTML and text renditions, a functional
  unsubscribe link and a functional preferences management link in the footer.
- **FR-NL-005**: The system MUST skip generation entirely for any user where
  `preferences.newsletterEnabled` is `false` or absent; no record MUST be created and no delivery
  MUST be triggered for these users.
- **FR-NL-006**: Newsletter content MUST be grouped into topic sections matching the user's
  `preferences.topics[]`, with one discrete section per topic, ordered by topic rank or declaration
  order, and stories within each section ordered by rank as provided by AI Curation.
- **FR-NL-007**: Every AI-generated summary item MUST carry a visible "Summary" label in both the
  HTML and text renditions; fallback items (title + snippet, `fallbackApplied: true`) MUST NOT
  carry the "Summary" label.
- **FR-NL-008**: Every newsletter record MUST persist `articleRefs[]` listing the unique identifiers
  of all articles referenced in the digest; duplicate article IDs MUST be deduplicated before
  persisting the record.
- **FR-NL-009**: The system MUST populate the `status` field of the newsletter record using the
  allowed lifecycle values: `pending` (record initialized, generation not yet started), `generated`
  (both HTML and text renditions produced successfully), `sent` (handed to the delivery layer),
  `failed` (generation or rendering encountered an unrecoverable error).
- **FR-NL-010**: If a `newsletters` record already exists with `status: generated` for the same
  `userId` and `date`, the pipeline MUST skip re-generation without error; existing records MUST
  NOT be overwritten by re-runs.
- **FR-NL-011**: The HTML template MUST apply Design System color tokens and typography rules:
  off-white or light-gray background, deep charcoal body text, serif headings (e.g., Playfair
  Display or equivalent), and sans-serif body text (e.g., Inter or equivalent), with at minimum
  8px/16px base spacing units.
- **FR-NL-012**: The HTML template MUST be mobile-first, producing a single-column layout that
  renders correctly in major email clients at narrow viewports (375px minimum) without horizontal
  scrolling.
- **FR-NL-013**: The optional "From the Blog" section MUST appear after all topic sections when a
  blog highlight is provided as input; it MUST be omitted entirely when no blog highlight is
  available, without leaving placeholder markup.
- **FR-NL-014**: The text rendition MUST be a functionally complete plain-text version of the
  newsletter, including all story titles, summaries or snippets, source attribution, section
  headings, and the unsubscribe and preferences links.
- **FR-NL-015**: Generation MUST NOT begin for a user if no `article_summaries` records are
  available for any of their declared topics and no fallback content can be constructed; in this
  case the record MUST be marked `failed` with a descriptive reason logged.

### Security & Privacy Requirements *(mandatory)*

- The generation pipeline MUST only access the preference record of the user being processed; it
  MUST NOT enumerate or cross-reference preferences from other users.
- The generation pipeline MUST NOT embed user personal data (email address, full name, internal user
  ID in a guessable format) in the rendered HTML or text bodies beyond what is required for the
  unsubscribe and preferences links.
- Unsubscribe links MUST use opaque, cryptographically non-guessable tokens; they MUST NOT expose
  raw `userId` values in GET parameters or URL paths.
- The `newsletters` record MUST be readable only by the generating pipeline service identity and the
  sending pipeline service identity; direct user-facing reads of the stored HTML blob are out of
  scope for Phase 1.
- Personal data written to `newsletters.html` and `newsletters.text` MUST be treated as sensitive
  content and MUST be subject to the same retention and deletion controls as the user preference
  record.
- The pipeline MUST enforce that only opted-in users (`newsletterEnabled: true`) can have a
  `newsletters` record created on their behalf; this check MUST be the first validation performed
  at the start of each per-user generation job.
- Pipeline logs and telemetry MUST NOT include rendered HTML, rendered text, article snippet content,
  or any user email address; logs are restricted to identifiers, status codes, and counts.

### Experience & Content Integrity Requirements *(mandatory for user-facing features)*

- The HTML email template MUST align with the Daily Paper Design System: modern, bright, minimal,
  premium in readability, content-first, and trustworthy.
- Design token usage in the template MUST follow the canonical color set: `--bg-primary` (`#F8FAFC`)
  for the email background, `--text-primary` (`#0F172A`) for body text, `--brand-primary`
  (`#3B82F6`) for primary links and section accents, and `--text-secondary` (`#475569`) for
  metadata fields such as source name and date.
- Section headings MUST use the serif headline treatment (H2 24px semi-bold equivalent in email-safe
  CSS); article titles MUST use H3 18px medium equivalent; body and snippet text MUST use 14–16px
  sans-serif.
- AI-generated summary content MUST be labeled "Summary" in a visually distinct treatment
  (e.g., a small chip, italicized label, or secondary-color badge) consistent with how the label
  appears in other Daily Paper digest surfaces.
- Source attribution MUST appear on every story item in both renditions: source name,
  publication date, and a functioning `canonicalUrl` link.
- AI-generated copy MUST NEVER be presented as an original headline or editorial statement; summary
  text MUST remain neutral, concise, and non-sensational in line with Daily Paper Principle III.
- The footer of every email MUST be clearly separated from content, must include the Daily Paper
  brand name, and must present the unsubscribe link and preferences link with legible label text
  (not icon-only or hidden behind ambiguous anchor text).
- Destructive or glow-heavy visual treatments from the Design System MUST NOT appear in the email
  template; any highlight colors MUST be used only for small state indicators such as topic labels.

### Observability & Telemetry Requirements *(mandatory)*

- The pipeline MUST emit per-run counts for: users evaluated, generation skipped (opted-out),
  generation skipped (no preferences), newsletters generated successfully, newsletters failed, and
  total `articleRefs` written.
- Each per-user generation job MUST log: `userId` hash (not raw), `date`, start time, completion
  time, `status` written to the record, and failure reason if `status: failed`.
- The pipeline MUST emit a structured event when a newsletter's `status` transitions from `pending`
  to `generated`, `sent`, or `failed` so that delivery operators can track per-user lifecycle state.
- Operators MUST be able to query the count of `status: failed` records per date to identify
  generation health regressions without reading rendered email content.
- Telemetry MUST be privacy-safe: logs MUST NOT include email addresses, raw user IDs, rendered HTML
  snippets, article titles, or preference values.

### Key Entities *(include if feature involves data)*

- **Newsletter**: The per-user, per-date generated digest record. Schema:
  ```
  newsletters {
    id             // unique record identifier
    userId         // authenticated owner of this digest record
    date           // the calendar date (ISO 8601 date) this newsletter represents
    subject        // rendered email subject line ("Your Daily Paper – [Date]")
    html           // fully rendered HTML email rendition
    text           // fully rendered plain-text email rendition
    articleRefs[]  // deduplicated list of article_summaries IDs included in this digest
    status         // lifecycle state: "pending" | "generated" | "sent" | "failed"
    failureReason  // human-readable failure description when status is "failed", else null
    createdAt      // ISO 8601 timestamp when the record was first written
    updatedAt      // ISO 8601 timestamp when the record was last modified
  }
  ```

- **Article Summary** *(input, owned by AI Curation)*: The ranked summary candidate record from
  `article_summaries`.  Fields consumed by this feature: `id`, `processedArticleId`, `summaryText`,
  `bulletPoints[]`, `fallbackApplied`, `modelInfo`, and the attribution fields (`canonicalUrl`,
  source name, `publishedAt`) derived from the originating `articles_processed` record.

- **Preference Profile** *(input, owned by Onboarding + Preferences)*: The user's saved preference
  record. Fields consumed: `userId`, `topics[]`, `newsletterEnabled`. `region` and `deliveryTime`
  are consumed by the scheduling layer and are not direct inputs to template rendering.

- **Newsletter Template**: The versioned HTML and text email skeleton. Not a persisted entity;
  a design artifact referenced by the rendering step of the pipeline. Changes to the template
  produce new `html` and `text` output on the next generation run.

---

## Test Plan

- **Unit coverage**:
  - Subject line rendering: given a date, verify the output matches `Your Daily Paper – [Weekday, Month Day]`.
  - Topic section assembly: given `article_summaries` for two topics, verify the rendered sections
    are separated, headings match the topic names, and stories appear in rank order.
  - AI summary label: given a record with `fallbackApplied: false`, verify the "Summary" label is
    present in the HTML output; given `fallbackApplied: true`, verify the label is absent.
  - Footer links: given a generated record, verify that both the unsubscribe URL and preferences URL
    are present and non-empty in HTML and text renditions.
  - Consent gate: given a user with `newsletterEnabled: false`, verify the generation function
    returns without writing a newsletter record.
  - Idempotency: given an existing `status: generated` record, verify a second generation call for
    the same `userId` and `date` does not create a new record or overwrite the existing one.
  - `articleRefs` deduplication: given an article appearing in two topic sections, verify it appears
    exactly once in `articleRefs[]`.
  - Status transitions: verify that a successfully rendered record transitions to `generated` and
    a rendering failure transitions to `failed` with a non-null `failureReason`.

- **Integration coverage**:
  - Newsletter record stored: run full generation for a user fixture with two topics and confirm a
    `newsletters` record is persisted with correct `userId`, `date`, `subject`, `html`, `text`,
    `articleRefs[]`, and `status: generated`.
  - Opted-out skip: confirm the database contains zero `newsletters` records after generation runs
    for a user with `newsletterEnabled: false`.
  - Missing summaries handling: run generation for a user whose topics have no `article_summaries`
    and confirm the record is marked `failed` with a `failureReason` present.
  - Blog highlight: run generation with and without a blog highlight input and confirm the section
    appears or is omitted correctly in both renditions.

- **End-to-end coverage**:
  - Full pipeline: given seeded `article_summaries` for two topics and a user preference fixture,
    generate a newsletter and verify the stored HTML contains topic headings, story titles, source
    attributions, Summary labels where appropriate, and a footer with both required links.

- **Regression coverage**:
  - Verify that a preference change after a newsletter has been generated for the day does not
    overwrite or alter the already-generated record.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of newsletters generated for opted-in users contain both a non-empty HTML
  rendition and a non-empty text rendition before `status` is set to `generated`.
- **SC-002**: 100% of newsletter records contain a footer with a functional unsubscribe link and a
  functional preferences link in both renditions.
- **SC-003**: 0% of newsletter records are created for users who have `newsletterEnabled: false`
  at generation time.
- **SC-004**: 100% of AI-summarized story items in generated newsletters carry a visible "Summary"
  label; 0% of fallback items carry this label.
- **SC-005**: 100% of story items in generated newsletters carry a source name and a `canonicalUrl`
  link traceable to the originating article.
- **SC-006**: Re-running generation for the same `userId` and `date` when a `status: generated`
  record already exists produces zero new records and leaves the existing record unchanged.
- **SC-007**: In a controlled render test across two standard email client viewports (375px mobile
  and 768px tablet), all topic sections, story text, and footer links remain readable and
  non-clipped with no horizontal scroll.
- **SC-008**: 0% of telemetry log entries produced by the pipeline contain rendered HTML, article
  text, user email addresses, or raw user preference values.

---

## Assumptions

- `article_summaries` records for date D are stable and fully written before the newsletter
  generation pipeline is triggered; the pipeline does not need to poll or wait for AI Curation to
  complete mid-run.
- The scheduling layer that determines when generation fires per user (based on `preferences.deliveryTime`)
  is implemented as a separate orchestration concern outside this spec; this feature spec covers
  only the generation and record-persistence behavior, not the trigger scheduling.
- Delivery sending (SMTP, transactional email provider, bounce handling) is out of scope for Phase 1;
  this spec covers record creation up to `status: generated`. The `sent` status value is reserved
  for the downstream sending pipeline.
- Unsubscribe token generation and validation is handled by the Auth or user-management service;
  this feature consumes a pre-generated opaque token and embeds it into the unsubscribe URL; it does
  not own the token lifecycle.
- The blog highlight input, when used, is a structured record (title, excerpt, link) provided by the
  Blog/CMS feature; sourcing that content is outside this spec's scope.
- A single newsletter generation run processes one user at a time; horizontal scaling across many
  users is an infrastructure concern and does not alter the per-user generation contract described
  here.
- Phase 1 does not support multiple newsletters per user per day, newsletter version history, or
  A/B template testing; these are deferred to future phases.
- The per-topic story count consumed from `article_summaries` inherits the per-category limit
  already enforced by the AI Curation pipeline; this feature does not impose an additional cap.
- Email client compatibility testing (Outlook, Gmail, Apple Mail, etc.) is an implementation-time
  concern; this spec requires mobile-first single-column rendering and Design System token alignment
  as the acceptance bar.
