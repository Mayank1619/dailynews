# Feature Specification: Blog + SEO Pages

**Feature Branch**: `[blog-seo]`

**Created**: 2026-05-26

**Status**: Draft

**Owner**: POD Web/SEO

**Dependencies**:
- Design System (`specs/features/design-system/spec.md`)
- Admin blog management

**Input**: User description: "Feature: Blog + SEO Pages. Goal: Drive organic traffic by publishing public, SEO-friendly digest/blog pages. As a visitor, I want to read Daily Paper blog posts by topic/date and discover the product."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Published Blog Content (Priority: P1)

As a visitor, I want to open the public blog index and see only published Daily Paper posts so I can quickly discover relevant content and trust what is publicly visible.

**Why this priority**: This is the core public outcome for organic discovery. If published content cannot be browsed safely at `/blog`, the feature does not meet its traffic goal.

**Independent Test**: Can be fully tested by publishing one or more posts in admin blog management, opening `/blog` as an anonymous visitor, and confirming only published posts are listed and openable.

**Acceptance Scenarios**:

1. **Given** one post is in `published` status and one post is in `draft` status, **When** a visitor opens `/blog`, **Then** only the published post appears in the index.
2. **Given** multiple published posts exist, **When** a visitor opens `/blog`, **Then** the index renders post title, excerpt, publication date, and a route to each post detail page.
3. **Given** no published posts exist, **When** a visitor opens `/blog`, **Then** the page renders a clear empty state without exposing draft data.

---

### User Story 2 - Read a Blog Post by Slug (Priority: P1)

As a visitor, I want to open a specific blog post at `/blog/[slug]` so I can read full content and evaluate Daily Paper.

**Why this priority**: Reading post details is the primary conversion-supporting journey after discovery from the index or search engines.

**Independent Test**: Can be fully tested by opening a known published slug and verifying the full post content renders with correct metadata, while draft or unknown slugs do not expose content.

**Acceptance Scenarios**:

1. **Given** a published post exists with slug `daily-ai-digest`, **When** a visitor opens `/blog/daily-ai-digest`, **Then** the full post content and associated SEO metadata are rendered.
2. **Given** a post exists but is in `draft` status, **When** a visitor opens its slug path, **Then** the visitor receives a non-disclosing not-found response and the draft content is not accessible.
3. **Given** a slug does not exist, **When** a visitor opens `/blog/unknown-slug`, **Then** the visitor receives a not-found response and no internal content is leaked.

---

### User Story 3 - Discover Content by Topic and Date (Priority: P2)

As a visitor, I want to filter blog posts by category/tag and publication date so I can find relevant content faster.

**Why this priority**: Topic/date filtering improves discoverability and retention but is secondary to baseline index and post delivery.

**Independent Test**: Can be fully tested by loading `/blog`, applying a tag or date filter, and verifying only matching published posts remain visible.

**Acceptance Scenarios**:

1. **Given** published posts are assigned different tags, **When** a visitor applies a tag filter, **Then** only published posts with that tag are shown.
2. **Given** published posts exist across multiple dates, **When** a visitor applies a date-based view, **Then** only posts in the selected date scope are shown.
3. **Given** a filter produces no results, **When** the filtered state is shown, **Then** the page displays a clear no-results message and remains usable.

---

### User Story 4 - Search Engine Friendly Blog Surface (Priority: P1)

As a visitor arriving from search engines or social previews, I want blog pages to have accurate metadata and canonical URLs so links are trustworthy, indexable, and shareable.

**Why this priority**: Organic traffic growth depends on correct SEO metadata, canonicalization, and sitemap coverage.

**Independent Test**: Can be fully tested by inspecting `/blog` and `/blog/[slug]` page outputs and sitemap contents for published pages.

**Acceptance Scenarios**:

1. **Given** a post is published, **When** search engines crawl site metadata, **Then** the post page includes title, description, OpenGraph fields, and a canonical URL.
2. **Given** published blog pages exist, **When** sitemap output is generated, **Then** all and only published blog URLs are included.
3. **Given** a page has a canonical URL, **When** the page is rendered, **Then** only one canonical URL is declared and it matches the public route.

### Edge Cases

- What happens when two draft posts resolve to the same candidate slug? Draft conflicts must be resolved before publication so public routing stays unambiguous.
- What happens when `publishedAt` is set in the future? The post must remain non-public until its publication time is reached.
- What happens when SEO title or description is missing? A deterministic fallback based on post title and excerpt must be used without leaving metadata blank.
- What happens when a visitor requests a slug for a draft post directly? The response must behave as not-found and must not reveal the post exists.
- What happens when a tag filter contains unknown or malformed values? The index must fail safely, show no results, and remain navigable.
- What happens when sitemap generation runs while posts are being updated? The resulting sitemap must remain valid and contain only currently published pages.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-BLOG-001**: Render blog index at `/blog` with published posts only.
- **FR-BLOG-002**: Render individual post at `/blog/[slug]` with SEO metadata.
- **FR-BLOG-003**: Generate sitemap entries for published blog pages only.
- **FR-BLOG-004**: Provide canonical URLs for blog index and blog post pages.
- **FR-BLOG-005**: The system MUST support category/tag filtering on the blog index while preserving published-only visibility.
- **FR-BLOG-006**: The system MUST support date-based browsing or filtering of published blog posts.
- **FR-BLOG-007**: The system MUST expose OpenGraph metadata for `/blog` and `/blog/[slug]` pages to support social previews.
- **FR-BLOG-008**: The system MUST maintain slug uniqueness among publicly reachable posts.
- **FR-BLOG-009**: The system MUST ensure posts in `draft` status are inaccessible to anonymous users at all public blog routes.
- **FR-BLOG-010**: The system MUST allow content to be manually managed in Phase 1 and preserve compatibility for future auto-generated posts from digest pipeline.
- **FR-BLOG-011**: The system MUST align blog page layout, typography hierarchy, spacing, and readability with the Design System and public-site direction.
- **FR-BLOG-012**: The system MUST present post content in a trust-preserving format that includes publication date and avoids misleading or sensational framing.
- **FR-BLOG-013**: The system MUST provide deterministic SEO metadata fallback behavior when optional SEO fields are absent.
- **FR-BLOG-014**: The system MUST support a recurring editorial calendar for SEO posts derived from newsletter topics, including AI, technology, politics, finance, sports, horoscopes, local news, and sample newsletter themes.
- **FR-BLOG-015**: The public site SHOULD provide sample newsletters that demonstrate what subscribers receive before signup.
- **FR-BLOG-016**: The growth workflow SHOULD include short-form video concepts and landing-page hooks that explain the product, show preference selection, and preview inbox output.
- **FR-BLOG-017**: The system MUST expose an admin-only marketing content generation workflow that can produce one SEO blog draft plus 10-second, 15-second, and 30-second short-form video scripts from a topic, audience, newsletter themes, and optional source summaries.
- **FR-BLOG-018**: The marketing generation workflow MUST return review controls, channel recommendations, signup/sample internal links, and automation notes before any generated content can become publicly published.
- **FR-BLOG-019**: The marketing generation workflow MUST use supplied source summaries only for factual current-event claims and MUST fall back to evergreen product education when no source summaries are provided.

### Security & Privacy Requirements *(mandatory)*

- Anonymous visitors MUST be able to access only `published` blog content; `draft` content MUST remain inaccessible and non-enumerable through public routes.
- Any status-change or content-management operations for blog posts MUST be restricted to authorized admin blog-management workflows.
- Public blog pages MUST avoid exposing internal identifiers or unpublished metadata not required for visitors.
- Telemetry for blog usage MUST be privacy-safe and must not collect unnecessary personal data from anonymous visitors.

### Experience & Content Integrity Requirements *(mandatory for user-facing features)*

- Blog pages MUST follow Daily Paper constitutional standards: modern, bright, minimal, content-first, and highly readable.
- Blog post rendering MUST preserve trustworthiness through neutral tone and clear editorial context.
- Metadata shown to visitors and crawlers MUST accurately represent page content and must not use deceptive SEO language.
- If AI-assisted or digest-derived content is published in later phases, it MUST be clearly framed as summary assistance and must not be presented as authoritative fact.
- Blog cards and detail layouts MUST follow the shared design-system component rules for article/blog readability.

### Observability & Telemetry Requirements *(mandatory)*

- The feature MUST emit privacy-safe product-health signals for blog index availability, blog detail availability, and sitemap generation success or failure.
- The feature MUST emit aggregate signals for tag/date filter usage and filter no-result states to monitor discoverability quality.
- The feature MUST emit audit-friendly events for public attempts to access non-published slugs without disclosing draft content.
- The feature MUST support verification signals that metadata, canonical URL, and sitemap outputs remain present for published pages.

### Key Entities *(include if feature involves data)*

- **blog_posts**: Public editorial records with attributes `{ id, title, slug, excerpt, contentHtml/markdown, tags[], status(draft|published), publishedAt, author?, seo:{title,description} }`.
- **Blog Post Status**: Visibility state that controls whether a post is publicly accessible (`published`) or blocked from anonymous access (`draft`).
- **SEO Metadata**: Per-page metadata object including page title, description, OpenGraph metadata, and canonical URL used for search and sharing correctness.
- **Sitemap Entry**: A discoverability record for each published blog route included in crawlable site maps.
- **Tag/Date Filter**: Visitor-facing discovery controls that constrain visible blog index results to matching published posts.

## Test Plan

- **Unit**: Validate slug generation and uniqueness rules, including collision handling for similar titles.
- **Unit**: Validate published-only visibility predicates and draft-inaccessibility checks.
- **Unit**: Validate metadata fallback behavior when optional `seo` fields are missing.
- **Unit**: Validate marketing content generation returns a compact prompt, SEO blog draft, and 10/15/30 second video scripts without requiring an AI provider.
- **Integration**: Validate sitemap output includes published blog URLs and excludes draft or future-dated posts.
- **Integration**: Validate the marketing content generation contract returns stable routes, review controls, and non-publishing automation notes.
- **E2E**: Validate `/blog` loads for anonymous users and lists only published posts.
- **E2E**: Validate `/blog/[slug]` loads for published posts and returns not-found for draft or unknown slugs.
- **E2E**: Validate category/tag and date filters return only matching published posts.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of published blog posts are visible and openable from `/blog` within one interaction.
- **SC-002**: 100% of draft blog posts remain inaccessible to anonymous visitors across all public blog routes.
- **SC-003**: 100% of published blog pages expose non-empty title, description, canonical URL, and social preview metadata.
- **SC-004**: 100% of sitemap blog entries correspond to currently published blog pages, with zero draft URLs present.
- **SC-005**: At least 90% of test participants can locate a relevant post by tag or date filter within 60 seconds.
- **SC-006**: 100% of blog pages reviewed for release meet Design System readability and hierarchy checks.
- **SC-007**: 100% of generated marketing content responses include one blog draft, exactly three video scripts, CTA/sample routes, and a human-review checklist.

## Assumptions

- Admin blog management is the source of truth for creating, editing, and changing post publication status.
- Public blog pages are anonymous-access surfaces and do not require login for reading published content.
- Phase 1 content entry is manual; future digest-pipeline automation will feed the same `blog_posts` schema without changing public URL behavior.
- Slug generation rules are deterministic and enforce unique public routes before publication.
- Design and content presentation constraints inherit from the Design System and Public Site feature direction.

## Growth Plan Update (2026-06-02)

### SEO Cadence

- Publish two posts per week from newsletter themes: "What changed in AI this week", "Market winners and losers", "Canadian politics digest", "Sports weekend brief", and "Horoscope plus culture roundup".
- Each post should target one clear search intent, include a sample newsletter section, and link to signup plus preferences.
- Reuse generated newsletter structure to reduce writing time: headline, why it matters, source-aware bullets, and a short CTA.

### Sample Newsletter Library

- Create public samples for AI/technology, markets/finance, sports, politics/world, horoscopes/culture, and local Canada news.
- Each sample must show topic chips, generation date, source labels, and a visible "Create my version" route to signup.
- Samples should be indexable public pages but not pretend to be live personalized output.

### Short Video Plan

- Weekly 20-40 second videos: problem hook, preference selection, AI-generated paper preview, inbox result, and Netfroot-powered credibility.
- First five scripts: "News without the scroll", "Choose your topics", "Your AI morning paper", "Daily vs weekly", and "See a sample before signup".
- Video pages and descriptions should point to the sample newsletter library and relevant blog posts.

## Marketing Agent Update (2026-06-02)

- Added protected Vercel route `POST /api/marketing/daily-content` for admin-only growth content generation.
- The workflow accepts `topic`, `audience`, `newsletterThemes`, `sourceSummaries`, `sampleRoute`, and `ctaRoute`.
- The response includes one SEO blog draft, 10-second/15-second/30-second short-video scripts, captions, hashtags, publish channels, review checklist, and automation notes.
- OpenAI generation uses compact JSON input and strict JSON output when `OPENAI_API_KEY` is configured; deterministic fallback keeps the flow usable when the AI provider is unavailable.
- The workflow generates drafts only. Public auto-publishing remains blocked until a persistent blog store and admin publish/review workflow are connected.
