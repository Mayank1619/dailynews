<!--
Sync Impact Report
Version change: 1.0 -> 1.0
Modified principles:
- P1 - "One Paper, One Habit" -> I. One Paper, One Habit
- P2 - Personalization Without Being Creepy -> II. Personalization by Explicit Choice
- P3 - Trust is the Feature -> III. Trust, Attribution, and Honest AI
- P4 - Privacy by Design -> IV. Privacy and Consent by Design
- P5 - Ship in Slices (SDD-first) -> V. Slice-First Delivery, Verification, and Observability
Added sections:
- Design and Product Standards
- Workflow, Review, and Quality Gates
- Governance
Removed sections:
- Purpose
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
Follow-up TODOs:
- None
-->

# Daily Paper Constitution

## Core Principles

### I. One Paper, One Habit
Daily Paper MUST deliver user value in under 60 seconds. Every experience that touches onboarding,
topic selection, digest assembly, or delivery MUST optimize for a ready-to-read outcome with minimal
friction. Primary actions MUST remain obvious above the fold, and product decisions that slow the
path to first digest without clear user value MUST be rejected.

### II. Personalization by Explicit Choice
Personalization MUST be driven primarily by user-declared preferences. Behavioral tracking, if added,
MUST be transparent, explicitly opt-in, and easy to disable. Features that infer sensitive interests,
hide preference logic, or create a surveillance-like experience are out of bounds.

### III. Trust, Attribution, and Honest AI
Daily Paper MUST present news as trustworthy, attributable, and clearly framed. Sources MUST never be
misrepresented or fabricated. Article-derived content MUST include source name, link to the original,
and timestamp when available. AI-generated copy MUST be labeled as summary or assistance, never as
authoritative truth, and editorial tone MUST remain neutral, concise, and non-sensational.

### IV. Privacy and Consent by Design
The product MUST collect and retain only the minimum data required to operate. Consent MUST be
explicit, auditable, versioned against terms or privacy text, and reversible at any time. Users who
have not opted in MUST be excluded from marketing exports and campaigns. Security and privacy controls
are constitutional requirements, not backlog enhancements.

### V. Slice-First Delivery, Verification, and Observability
Work MUST be delivered in small, testable slices following Spec-Driven Development. Each feature MUST
progress through spec, acceptance criteria, security and edge-case review, test planning, and then
implementation. No feature is complete until tests pass, telemetry or audit logging is added where
applicable, and the resulting UX conforms to this constitution. Large unverified "big bang" merges are
not permitted.

## Design and Product Standards

Daily Paper MUST read as a governing design and product standard for every user-facing and internal
surface in the repository.

Brand and design direction:
- The product MUST feel modern, bright, minimal, and premium in readability.
- Gaming-inspired energy MAY appear only as restrained accents; childish styling and cyberpunk excess
	are prohibited.
- The intended visual character is content-first, crisp, energetic, clean, and trustworthy.

UI style rules:
- Desktop layouts MUST use a 12-column grid; mobile layouts MUST stack cleanly.
- Typography MUST pair a modern or high-contrast serif headline treatment with a clean sans-serif UI
	body style and maintain strong hierarchy.
- Motion MUST stay subtle, within roughly 150-250ms, and communicate state rather than decoration.
- Shadows MUST remain soft and low-opacity; glow MUST be limited to interactive elements on
	hover or focus and MUST never be used on large surfaces or backgrounds.
- Accessibility MUST meet WCAG AA contrast expectations, preserve visible focus states, and support
	keyboard navigation across onboarding and admin flows.

Color system guidance:
- Backgrounds MUST remain off-white or very light gray, with deep charcoal text instead of pure black.
- Brand primary MUST come from an electric blue or cyan family; brand secondary MUST come from a neon
	lime or mint family.
- Highlight colors in a magenta or violet family MUST be used sparingly for special states such as
	trending or new badges.
- Implementations SHOULD use stable semantic tokens such as `--bg-*`, `--text-*`, `--brand-*`,
	`--accent-*`, `--success`, `--warning`, and `--error`.

Component language:
- Primary buttons MUST use the brand accent with strong contrast; secondary buttons MUST use outline
	treatment with restrained hover glow; destructive buttons MUST use explicit destructive color.
- Inputs and forms MUST use clear labels, actionable validation messaging, and readable consent
	controls that are never obscured by marketing copy.
- Cards MUST support article previews, blog previews, and admin panels with minimal shadow,
	disciplined spacing, and source attribution where relevant.
- Topic chips MUST remain pill-shaped with bright outlines and a clear selected state.
- Navigation MUST provide a strong public CTA, a logged-in user menu, and a clearly sectioned admin
	sidebar.

Content and tone:
- Voice MUST remain friendly, modern, concise, neutral, and trustworthy.
- Microcopy MUST avoid hype around AI and reinforce user control, for example by making preference
	changes and digest readiness explicit.

MVP scope and product direction:
- Phase 1 MUST cover signup/login, preferences, region and delivery schedule, RSS or API ingestion
	from free-first sources, digest generation, email delivery, SEO blog pages, an admin dashboard, and
	associated test coverage.
- Monetization items such as subscriptions, paid tiers, and campaign automation remain Phase 2+
	work and MUST require explicit user opt-in where relevant.
- Default stack direction remains React with SEO support, preferably Next.js for public and blog
	surfaces; Node.js services using Express or Fastify for backend and scheduled worker flows; Firestore
	with least-privilege security rules; and automated unit, integration, and Playwright E2E testing.

Open items retained for future decisions:
- Exact palette hex codes and final typography selections.
- Final source list for RSS or API ingestion.
- Initial email provider selection for free-tier delivery.
- Final admin role breakdown, including Admin versus Admin+Editor.

## Workflow, Review, and Quality Gates

Security standards:
- Passwords MUST be hashed with a modern algorithm such as bcrypt or argon2 and MUST never be stored
	in plaintext.
- Login attempts MUST be rate limited.
- Email verification MUST occur before newsletter delivery.
- RBAC MUST protect admin routes and actions, and all admin actions MUST be audit logged.
- Data in transit MUST be encrypted with TLS, database access MUST follow least privilege, and logs
	MUST exclude sensitive data.
- Consent records MUST store boolean flags, timestamp, and terms or privacy version.

Testing and release quality:
- Unit tests MUST cover core business logic including auth, preferences, ingestion, digest generation,
	and consent gating.
- Integration tests MUST cover API behavior and system boundaries.
- Playwright E2E coverage MUST include positive flows, negative auth or admin flows, and consent flows
	where opt-out behavior matters.
- Lint and formatting checks MUST pass before merge.
- Unit tests MUST pass before merge.
- A Playwright smoke suite MUST pass on PR merges; fuller suites MAY run nightly.
- Backend coverage for MVP SHOULD remain within a 60-70% baseline while critical flows such as auth,
	consent, and admin RBAC MUST be covered regardless of aggregate percentage.

Spec-Driven Development rules:
- Every feature spec MUST include user stories, acceptance criteria, edge cases, security
	considerations, and a test plan that maps unit and E2E coverage.
- API contracts MUST be defined before implementation when interfaces are involved.
- Data model changes MUST be documented in the spec or planning artifacts before code lands.

Definition of done and review:
- A feature is done only when acceptance criteria are met, required tests are added and passing,
	security controls are applied, telemetry or audit logging is present where applicable, and the
	delivered UX matches the constitutional design system.
- PR review MUST verify compliance with the constitutional principles, design standards, privacy
	guarantees, security rules, and quality gates before approval.

Telemetry and analytics:
- Product telemetry MUST remain privacy-safe and limited to product health signals such as newsletter
	send status, supported aggregate open and click reporting, activation funnel progression, and admin
	audit events.
- Hidden tracking and sale of personal data are forbidden.

## Governance

This constitution governs all specs, plans, tasks, UX, code, tests, and review decisions in this
repository. When another document conflicts with this constitution, this constitution prevails.

Amendment policy:
- Amendments MUST be approved by the stakeholder and reviewed by POD leads.
- Every amendment MUST include an updated Sync Impact Report and any required downstream template or
	workflow changes.

Versioning policy:
- Version 1.0 remains in force because this amendment preserves the existing constitutional substance
	while converting it into Spec Kit structure.
- Future MAJOR changes MUST be used for incompatible principle removals or redefinitions.
- Future MINOR changes MUST be used for new principles or materially expanded governance.
- Future PATCH changes MUST be used for clarifications or non-semantic wording updates.

Compliance review expectations:
- Constitution compliance MUST be checked during specification, planning, implementation, and review.
- Any exception to a constitutional gate MUST be documented explicitly in planning artifacts and
	approved before implementation proceeds.

**Version**: 1.0 | **Ratified**: 2026-05-26 | **Last Amended**: 2026-05-26
