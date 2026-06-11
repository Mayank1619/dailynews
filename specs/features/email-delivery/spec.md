# Feature Specification: Email Delivery + Scheduling

**Feature Branch**: `email-delivery`

**Created**: 2026-05-26

**Status**: Draft

**Owner**: POD Delivery

**Dependencies**:
- Authentication + Consent (`specs/features/authentication-consent/spec.md`)
- Newsletter Generation (`specs/features/newsletter-generation/spec.md`)

---

## Overview

Email Delivery + Scheduling is the pipeline responsible for reliably dispatching the `newsletters`
records produced by Newsletter Generation to opted-in, verified users at the right time. It
operates as a scheduled job: for each user whose `deliveryTime` window matches the current run
time, the pipeline performs a pre-flight eligibility gate, then hands the prepared newsletter to an
email provider. It manages retry logic, idempotency, and delivery logging throughout.

This feature implements the last mile of the Daily Paper delivery chain and operates under all five
constitutional principles. Principle IV (Privacy and Consent by Design) is the governing constraint:
**no email is ever sent to a user who fails the pre-flight eligibility gate** (verified + active +
`newsletterEnabled: true`). All consent reversal paths — unsubscribe, admin block — take effect
before the next scheduled send run.

**Consumes**:
- `newsletters` records with `status: generated` from Newsletter Generation
- `users` record: `isVerified`, `status`, `email`, `deliveryTime` (from Onboarding + Preferences)
- `preferences` record: `newsletterEnabled`, `deliveryTime`, `timezone`
- `consents` record: `newsletter`, `offers` consent flags

**Outputs**:
- `email_logs` records (outcome of each send attempt per user per newsletter)
- Side effects: `preferences.newsletterEnabled` set to `false` on confirmed unsubscribe

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Receive My Newsletter at the Time I Chose (Priority: P1)

As a fully opted-in, verified user, I want my Daily Paper newsletter delivered to my inbox at the
time I selected during onboarding, so I can read it as part of my morning routine without any
manual action.

**Why this priority**: Reliable, timely delivery is the entire purpose of this feature. Everything
else — retries, logging, unsubscribe — supports this core outcome.

**Independent Test**: Can be fully tested by creating a user fixture with `isVerified: true`,
`status: active`, `newsletterEnabled: true`, a `newsletters` record with `status: generated`, and
a `deliveryTime` matching the current scheduled window; running the delivery job; and confirming
a successful send call was made and an `email_logs` record with `status: sent` was created.

**Acceptance Scenarios**:

1. **Given** a user is verified, active, and has `newsletterEnabled: true`, **When** the scheduled
   delivery job runs within their `deliveryTime` window, **Then** the newsletter is sent to their
   verified email address and an `email_logs` record with `status: sent` is created.
2. **Given** a `deliveryTime` preference includes a timezone, **When** the delivery job evaluates
   the user for the current run, **Then** the send is scheduled relative to the user's local
   timezone so they receive email at the correct local time.
3. **Given** delivery completes successfully, **When** the `email_logs` record is inspected,
   **Then** it contains `status: sent`, a non-null `providerMessageId`, and a `createdAt` timestamp;
   it MUST NOT contain email body content, newsletter HTML, raw auth tokens, or password hashes.

---

### User Story 2 — Delivery Succeeds Even When the First Attempt Fails (Priority: P1)

As a user, I want to receive my newsletter even if the initial delivery attempt encounters a
transient failure, so I am not silently left without my paper due to a brief network or provider
outage.

**Why this priority**: Retry logic directly affects delivery reliability. Without it, transient
infrastructure failures create silent gaps that undermine user trust.

**Independent Test**: Can be fully tested by simulating a mock email provider that rejects the first
two attempts and succeeds on the third, then confirming that an `email_logs` record with
`status: sent` is produced and no duplicate email is dispatched by subsequent job runs.

**Acceptance Scenarios**:

1. **Given** the email provider returns a transient error on the first attempt, **When** the retry
   scheduler runs subsequent attempts, **Then** the delivery succeeds within the configured retry
   limit and a single `email_logs` record with `status: sent` is created.
2. **Given** all retry attempts are exhausted without a successful send, **When** the final attempt
   fails, **Then** a single `email_logs` record with `status: failed`, the error reason, and a null
   `providerMessageId` is created, and no further retry is attempted for that delivery run.
3. **Given** the delivery job runs again after a successful send (idempotency check), **When** the
   pipeline evaluates the same `userId` + `newsletterId` pair, **Then** it detects the existing
   `email_logs` record with `status: sent` and skips the user without issuing a duplicate send.

---

### User Story 3 — My Unsubscribe Request Is Honoured Immediately (Priority: P1)

As a user who has unsubscribed, I want my newsletter delivery to stop permanently from the next run,
so I am confident my choice is respected and I will not receive further unwanted email.

**Why this priority**: Honouring unsubscribe requests is both a legal requirement (CAN-SPAM / CASL)
and a constitutional obligation under Principle IV. It is P1 because failure here constitutes a
compliance violation, not a quality issue.

**Independent Test**: Can be fully tested by setting `preferences.newsletterEnabled: false` for a
user, running the delivery job, and confirming no send attempt is made and the `email_logs` record
shows `status: skipped` with reason `user_unsubscribed`.

**Acceptance Scenarios**:

1. **Given** a user has unsubscribed (i.e., `newsletterEnabled: false`), **When** the delivery job
   runs, **Then** the user is excluded from the send batch, no email provider call is made, and an
   `email_logs` record with `status: skipped` and reason `user_unsubscribed` is created.
2. **Given** a user clicks the unsubscribe link in a delivered email, **When** they confirm
   unsubscription, **Then** `preferences.newsletterEnabled` is set to `false` and no further
   newsletters are sent in subsequent delivery runs.
3. **Given** a user re-subscribes by setting `newsletterEnabled: true` after previously unsubscribing,
   **When** the next delivery job runs, **Then** delivery resumes normally for that user.

---

### User Story 4 — Unverified and Blocked Users Are Never Sent Email (Priority: P1)

As the system operator, I want the delivery pipeline to enforce that only users who are both email-
verified and in active standing receive newsletters, so that the service never sends email to
addresses that were not confirmed or to accounts that have been suspended.

**Why this priority**: Pre-flight eligibility gating is a constitutional invariant under Principle
IV and a security standard. It must be P1 because it is a compliance hard stop, not an optional
check.

**Independent Test**: Can be fully tested independently for each gate condition: (a) a user with
`isVerified: false` and a `newsletters` record — confirm no send, `email_logs` shows
`status: skipped` with reason `email_not_verified`; (b) a user with `status: blocked` — confirm
no send, `email_logs` shows `status: skipped` with reason `account_blocked`.

**Acceptance Scenarios**:

1. **Given** a user has `isVerified: false`, **When** the delivery job runs, **Then** the user is
   skipped, no email provider call is made, and the skip is logged with reason `email_not_verified`.
2. **Given** a user has `status: blocked`, **When** the delivery job runs, **Then** the user is
   skipped, no email provider call is made, and the skip is logged with reason `account_blocked`.
3. **Given** a user passes all three gate conditions (verified + active + `newsletterEnabled: true`),
   **When** the delivery job runs and a `newsletters` record with `status: generated` exists for
   the current date, **Then** and only then does the pipeline proceed to the send attempt and
   provider call.

---

### User Story 5 — Operators Can See Delivery Health Without Accessing Personal Data (Priority: P2)

As an operator, I want to monitor delivery success rates, retry volumes, and skip reasons in
aggregate, so I can detect delivery failures and investigate without needing to access email
addresses or newsletter content.

**Why this priority**: Observability is required under constitutional Principle V and is essential
for production confidence. It is P2 because the core send path must work first.

**Independent Test**: Can be fully tested by running a batch delivery job over a mixed fixture
(some sent, some skipped, some failed) and inspecting the produced `email_logs` records to confirm
that all required status, reason, and timestamp fields are present and no PII fields are populated
in log payloads.

**Acceptance Scenarios**:

1. **Given** a delivery batch completes with a mix of sent, skipped, and failed outcomes, **When**
   the `email_logs` table is queried, **Then** each record contains `status`, `createdAt`, and
   where applicable `error` (without PII); none contain email body text, rendered HTML, raw email
   addresses inline, or auth tokens.
2. **Given** the observability pipeline aggregates delivery metrics, **When** the operator dashboard
   queries delivery health, **Then** it MUST surface total attempted, sent, skipped (with reason),
   and failed counts per run date without exposing individual user identities.

---

### Edge Cases

- What happens when a user's `newsletterEnabled` is `true` but their `consents.newsletter` record
  is absent or `false`? The delivery pipeline MUST treat the absence of a valid newsletter consent
  record as a disqualifying condition and skip the user, logging reason `consent_missing`.
- What happens when a `newsletters` record exists but has `status: failed` or `status: pending`
  (not `generated`)? The delivery pipeline MUST NOT attempt to send a newsletter that is not in
  `status: generated`; it skips the user for the current run.
- What happens when the email provider returns a permanent hard-bounce or rejection (non-transient)?
  The pipeline MUST NOT retry a hard failure; it MUST log `status: failed` with the error code and
  MUST alert operators without further retries for that delivery run.
- What happens when the same user has already received a successful send for today's newsletter
  (`email_logs` record with `status: sent` exists for this `userId` + `newsletterId` pair)?
  The pipeline MUST skip the user and MUST NOT issue a duplicate send call, preserving idempotency.
- What happens when a timezone-aware delivery time cannot be resolved because `timezone` is absent
  from the user's preferences? The pipeline MUST fall back to a configured default delivery
  timezone and log the fallback; it MUST NOT skip the user on this basis alone.
- What happens when the user's email address contains unusual but valid characters or encoding?
  The pipeline MUST pass the address to the provider without modification; address normalisation
  or canonicalisation is not within scope for Phase 1.
- What happens when the scheduled job is delayed and fires outside the intended delivery window?
  Each run MUST evaluate users whose `deliveryTime` window falls within the current run window;
  late runs MUST process eligible users from the missed window and log a late-delivery marker
  to operations.
- What happens when marketing or promotional offers content is present in a newsletter record for a
  user whose `consents.offers` is `false`? The pipeline MUST NOT deliver that content; offers
  sections MUST be stripped or the entire send MUST be suppressed if stripping is not possible,
  and the decision MUST be logged. *(This gate is a Phase 1 hard rule even though
  offers content is a Phase 2+ feature.)*
- What happens when the configured retry limit N is reached and the send still fails? The final
  `email_logs` record MUST be set to `status: failed` with all retry attempts documented, and an
  operator alert MUST be raised to flag the unresolvable failure.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-EMAIL-001**: The system MUST send newsletters only to users who pass the pre-flight
  eligibility gate: `isVerified: true` AND `status: active` AND `preferences.newsletterEnabled: true`
  AND `consents.newsletter: true`. This gate MUST be the first check performed per user in every
  delivery run.
- **FR-EMAIL-002**: The system MUST schedule delivery relative to the user's declared `deliveryTime`
  preference; where a `timezone` is stored, the delivery window MUST be evaluated in that local
  timezone; where no timezone is stored, the system MUST fall back to a configured default timezone
  and log the fallback.
- **FR-EMAIL-003**: The system MUST retry failed sends up to a configurable maximum of N attempts
  (default N = 3) for transient failures before marking the delivery as permanently failed; non-
  transient (hard-bounce / permanent) failures MUST NOT be retried.
- **FR-EMAIL-004**: The system MUST create one `email_logs` record per delivery attempt per user per
  newsletter, capturing `status` (sent / failed / skipped), `providerMessageId` (when available),
  `error` (when applicable), and `createdAt`; log entries MUST NOT contain email body content,
  newsletter HTML, rendered article text, raw email addresses, auth tokens, or password material.
- **FR-EMAIL-005**: When a user unsubscribes — whether via the email footer link or through the
  preferences screen — the system MUST set `preferences.newsletterEnabled` to `false` and MUST
  exclude that user from all subsequent delivery runs; this change MUST take effect before the next
  scheduled delivery run executes.
- **FR-EMAIL-006**: The delivery pipeline MUST be idempotent: if an `email_logs` record with
  `status: sent` already exists for the same `userId` + `newsletterId` pair, the pipeline MUST
  skip that user and MUST NOT make a second send call to the email provider.
- **FR-EMAIL-007**: The system MUST only send newsletters that have `status: generated` in the
  `newsletters` table; records with `status: pending`, `status: failed`, or any other value MUST
  NOT be dispatched.
- **FR-EMAIL-008**: Marketing and offers content MUST NOT be included in any Phase 1 delivery unless
  the user's `consents.offers` flag is `true`. Since offers content is a Phase 2+ feature, Phase 1
  newsletters MUST contain no offers sections; this requirement is stated explicitly to prevent
  unintentional inclusion as the codebase evolves.
- **FR-EMAIL-009**: The system MUST expose the delivery pipeline outcome via structured `email_logs`
  records sufficient for operators to query delivery health (sent/failed/skipped counts per run
  date) without accessing email body content or personal data fields.
- **FR-EMAIL-010**: The system MUST raise an operator-visible alert when a user's delivery has
  exhausted all retries and reached `status: failed`, enabling manual investigation without direct
  access to production personal data.

### Security & Privacy Requirements *(mandatory)*

- The pre-flight eligibility gate (`isVerified`, `status: active`, `newsletterEnabled: true`,
  `consents.newsletter: true`) is a **constitutional invariant**: no email MUST ever be dispatched
  unless all four conditions are satisfied. This check MUST be atomic and MUST occur before any
  email provider API call is initiated.
- Marketing and promotional offers content (Phase 2+) MUST NOT be delivered unless `consents.offers`
  is explicitly `true`; the absence or `false` value of this flag is an absolute block, not a
  degraded-mode case.
- All communication between the delivery pipeline and the email provider MUST occur over an
  encrypted channel (TLS). Provider API credentials MUST be stored as secrets and MUST NOT be
  committed to source code or written to logs.
- `email_logs` records MUST NOT persist rendered HTML, rendered text, article body content, raw
  email addresses, auth tokens, or any password-derived material. Logs are restricted to structural
  identifiers (`id`, `userId`, `newsletterId`), status fields, provider message IDs, and sanitised
  error codes or messages.
- The delivery service MUST access only the user records required for the current delivery run; it
  MUST NOT enumerate the full user table without query filters scoping the result to the expected
  delivery window.
- Unsubscribe tokens embedded in email footers MUST be opaque and cryptographically non-guessable;
  they MUST NOT expose raw `userId` values in URL parameters or paths (aligned with
  Newsletter Generation `FR-NL-004` and its security note on unsubscribe token design).
- Retry state, provider error payloads, and delivery-loop telemetry MUST be sanitised before
  writing to logs or alerting channels; raw provider error bodies that may include user data MUST
  be truncated and redacted before storage.
- All admin or pipeline-service actions on delivery records MUST be auditable; delivery audit events
  MUST include job run ID, outcome counts, and timestamps, NOT user-identifying details.

### Observability & Telemetry Requirements *(mandatory)*

- The delivery pipeline MUST emit a structured event for each of the following outcomes:
  `delivery.attempted`, `delivery.sent`, `delivery.failed`, `delivery.skipped`, `delivery.retried`,
  `delivery.idempotency_skip`, and `delivery.unsubscribe_processed`.
- Each event MUST carry a job run identifier, a `reason` field for skipped events (one of:
  `email_not_verified`, `account_blocked`, `user_unsubscribed`, `consent_missing`,
  `newsletter_not_ready`, `already_sent`), a `createdAt` timestamp, and — for send events —
  the `providerMessageId`.
- Events MUST NOT include email body content, newsletter HTML, article snippets, user email
  addresses, auth tokens, or any other PII beyond opaque internal identifiers.
- Aggregate metrics MUST be sufficient to compute for any given run date: total eligible users,
  total sent, total skipped (by reason), total failed, total retried, and any late-delivery counts.
- Operator alerts MUST fire when: (a) the failed count for a run exceeds a configurable threshold,
  (b) any individual send exhausts all retries, or (c) the scheduled job does not start within a
  configurable late-start window.
- Delivery health MUST be queryable by run date without accessing `email` fields or any rendered
  content column.

### Key Entities *(include if feature involves data)*

- **email_logs**: Represents the outcome of one send attempt for one user's newsletter.
  - `id`: Unique record identifier
  - `userId`: Reference to the user account (opaque internal identifier)
  - `newsletterId`: Reference to the `newsletters` record that was dispatched
  - `status`: Enum — `sent` | `failed` | `skipped`
  - `providerMessageId`: Optional — populated on successful send, used for delivery traceability
    and potential open/click reporting (Phase 2+); null on failure or skip
  - `error`: Optional — sanitised error description on failure; null on success or skip
  - `skipReason`: Optional — populated on `status: skipped`; one of `email_not_verified`,
    `account_blocked`, `user_unsubscribed`, `consent_missing`, `newsletter_not_ready`, `already_sent`
  - `retryCount`: Number of send attempts made before the final status was recorded
  - `createdAt`: Timestamp of record creation

- **Delivery Run**: Logical grouping of all send attempts executed within a single scheduler
  invocation. Identified by a job run ID. Used for aggregate health reporting.

- **User (reference)**: Consumed but not owned by this feature.
  See `specs/features/authentication-consent/spec.md`.
  Relevant fields: `id`, `email`, `isVerified`, `status`.

- **Preferences (reference)**: Consumed but not owned by this feature.
  See `specs/features/onboarding-preferences/spec.md`.
  Relevant fields: `newsletterEnabled`, `deliveryTime`, `timezone`.

- **Consents (reference)**: Consumed but not owned by this feature.
  See `specs/features/authentication-consent/spec.md`.
  Relevant fields: `newsletter`, `offers`.

- **Newsletter (reference)**: Consumed but not owned by this feature.
  See `specs/features/newsletter-generation/spec.md`.
  Relevant fields: `id`, `userId`, `date`, `status`, `html`, `text`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users who have completed email verification receive their newsletter within the
  delivery window they selected, measured across at least 95% of eligible users per daily run
  under normal operating conditions.
- **SC-002**: Transient delivery failures are recovered without user intervention in at least 90%
  of cases where the provider ultimately succeeds within the configured retry limit.
- **SC-003**: No unsubscribed, unverified, or blocked user receives a newsletter email; the
  pre-flight gate has a zero-tolerance failure rate for consent and eligibility violations.
- **SC-004**: Delivery health for any run date can be determined from `email_logs` and operational
  events within 5 minutes of run completion, without requiring access to email body content or
  personal data fields.
- **SC-005**: Duplicate emails (same user + newsletter combination) are never sent; idempotency
  holds across re-runs, retries, and scheduler restarts.
- **SC-006**: Operator alerts fire within the defined threshold window when a delivery run produces
  failures above the configured alert threshold, enabling investigation before the next scheduled run.

---

## Assumptions

- Newsletter Generation is a hard dependency: delivery cannot proceed without a `newsletters` record
  with `status: generated` for the target date. Delivery does not generate or re-generate newsletter
  content itself.
- The initial email provider is Brevo's transactional email API because its free tier currently
  supports 300 email sends per day. The delivery pipeline remains provider-agnostic at the adapter
  level to allow future provider changes without rewriting delivery logic.
- Phase 1 delivers one newsletter per user per day. Multiple newsletters per user per day (breaking
  news, campaigns) are Phase 2+ scope and are excluded here.
- Offers and marketing content is a Phase 2+ feature. Phase 1 newsletters contain no offers
  sections. The offers consent gate (`consents.offers`) is defined here as a hard rule to future-
  proof the codebase, not because Phase 1 delivery will ever encounter offers content in practice.
- Delivery time scheduling in Phase 1 is best-effort within the scheduled job's run window.
  Sub-minute or real-time delivery precision is not a Phase 1 guarantee.
- Re-subscription after unsubscription is supported by clearing the `newsletterEnabled: false`
  flag through the preferences screen; no separate re-confirmation email flow is required in Phase 1.
- The unsubscribe token format and lifecycle are owned by the Newsletter Generation feature
  (`FR-NL-004`); this feature consumes and validates those tokens but does not define them.
- The default timezone fallback value (used when a user has no stored timezone) is a configurable
  constant; the specific default (e.g., UTC) is an implementation decision outside the spec.

## Implementation Update (2026-06-02, Brevo Delivery Adapter)

- Added a Brevo transactional email adapter using `POST https://api.brevo.com/v3/smtp/email`.
- Added protected Vercel route `POST /api/newsletter/send-test` for admin-only test newsletter generation and sending.
- Sending requires `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, and optional `BREVO_SENDER_NAME`; missing credentials return a setup error and never retry.
- Newsletter preview and send routes require `NEWSLETTER_ADMIN_TOKEN` so the deployed app cannot be used as an open email relay.

---

## Test Plan

- **Unit coverage**:
  - Pre-flight eligibility gate: each condition (`isVerified`, `status`, `newsletterEnabled`,
    `consents.newsletter`) tested independently and in combination.
  - Idempotency guard: confirm no second send is attempted when a `status: sent` log record exists.
  - Retry logic: simulate transient failure up to N−1 attempts then success; simulate exhaustion
    to N attempts and confirm `status: failed` outcome.
  - Skip reason assignment: verify each `skipReason` value is emitted for the correct condition.
  - Timezone resolution: verify delivery window calculation against stored timezone; verify fallback
    to default when timezone is absent.
  - Offers gate: verify no offers content passes to the provider when `consents.offers` is
    `false` or absent.

- **Integration coverage**:
  - Full delivery run against a mock email provider: mixed fixture (sent, skipped-unverified,
    skipped-blocked, skipped-unsubscribed, failed-exhausted-retries).
  - Idempotency: run delivery twice for the same fixture; confirm provider is called exactly once
    per user and log records are not duplicated.
  - Unsubscribe flow: trigger unsubscribe endpoint, confirm `newsletterEnabled` set to `false`,
    run next delivery cycle, confirm user is excluded.
  - Late-delivery fallback: simulate delayed job run and confirm eligible users from the expected
    window are still processed with a late-delivery log marker.

- **End-to-end coverage**:
  - Register → verify email → complete preferences with `deliveryTime` → run newsletter generation
    → run delivery job → confirm email delivered to test inbox or mock transport.
  - Register → verify email → receive email → click unsubscribe → confirm `newsletterEnabled: false`
    → run delivery job → confirm no second email delivered.
  - Attempt delivery for unverified account → confirm no email sent and log record shows
    `status: skipped` with reason `email_not_verified`.

- **Security coverage**:
  - Confirm no email addresses, newsletter HTML, article snippets, or auth tokens appear in
    `email_logs` records.
  - Confirm provider API credentials do not appear in any log output, alert payload, or error event.
  - Confirm unsubscribe tokens in delivered emails are opaque and do not expose raw `userId` values.
