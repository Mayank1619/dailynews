# Feature Specification: User Dashboard + Newsletter History

**Feature Branch**: `user-dashboard`

**Created**: 2026-05-26

**Status**: Draft

**Owner**: POD Web

**Dependencies**:
- Authentication + Consent (`specs/features/authentication-consent/spec.md`)
- Onboarding + Preferences (`specs/features/onboarding-preferences/spec.md`)
- Email Delivery + Scheduling (`specs/features/email-delivery/spec.md`)

---

## Overview

The User Dashboard is the primary self-service control centre for authenticated Daily Paper users.
It gives users a single destination to review their personalisation choices, browse their newsletter
history, manage delivery state, and perform account-level actions. It is the canonical landing point
for two key inter-feature flows: the **edit-preferences** redirect from the dashboard back into the
Onboarding + Preferences feature, and the **unsubscribe confirmation** redirect referenced by
email-delivery footer links. Nothing in this feature is visible to unauthenticated visitors.

This feature operates under all five constitutional principles. Principle IV (Privacy and Consent by
Design) is the governing constraint: **the dashboard MUST only ever display data that belongs to the
signed-in user, and every user-control action MUST be reversible except the explicitly scoped
account-deletion path.**

---

## User Scenarios & Testing *(mandatory)*

<!--
  Stories are ordered by priority. Each story is independently testable and delivers standalone
  value aligned with the constitutional requirement for slice-first delivery (Principle V).
-->

### User Story 1 — View My Dashboard Home (Priority: P1)

As a signed-in user, I want to open my dashboard and immediately see a summary of my current
preferences and my recent newsletter history so I understand what my Daily Paper is configured to
deliver and what I have already received.

**Why this priority**: The dashboard home is the foundation of every other user-control story. It
is also the landing target for the unsubscribe confirmation flow from email-delivery and for
returning users after login. Without a working home view, none of the control actions in P2–P4
can be contextualised.

**Independent Test**: Can be fully tested by signing in as a user with saved preferences and at
least one `email_logs` record, navigating to the dashboard, and confirming that the preferences
summary and newsletter history list render completely without requiring further interaction.

**Acceptance Scenarios**:

1. **Given** I am signed in and have saved preferences, **When** I navigate to the dashboard home,
   **Then** I see my active topic count, region, delivery time, and newsletter delivery state
   (active or paused) shown in a preferences summary card.
2. **Given** I have received one or more newsletters, **When** the dashboard history list renders,
   **Then** each row shows the newsletter date, delivery status (sent / failed / skipped), and —
   where available — a link to the web-readable version of that newsletter.
3. **Given** I have never received a newsletter, **When** the history section renders,
   **Then** I see a clear empty state that explains I have no history yet and indicates that my
   first digest is on its way once preferences are saved and delivery is active.
4. **Given** my authenticated session has expired, **When** I attempt to navigate to the dashboard,
   **Then** I am redirected to the login screen and returned to the dashboard after re-authentication.

---

### User Story 2 — Edit My Preferences from the Dashboard (Priority: P2)

As a returning user, I want to reach my preferences editor directly from the dashboard so I can
update my topics, region, or delivery time without having to find a separate settings page.

**Why this priority**: The dashboard is the natural hub for preference management. The
Onboarding + Preferences feature defines the edit flow; this feature only needs to surface the
correct entry point and confirm that the dashboard reflects any saved changes on return.

**Independent Test**: Can be fully tested by clicking the edit link in the preferences summary
card, completing a change in the preferences editor, returning to the dashboard, and confirming
the updated values are shown in the summary card without a manual refresh.

**Acceptance Scenarios**:

1. **Given** I am viewing the dashboard home, **When** I click the "Edit Preferences" link in the
   preferences summary card, **Then** I am taken to the preferences editor screen defined in
   `specs/features/onboarding-preferences/spec.md`.
2. **Given** I save a change to my preferences in the editor, **When** I return to the dashboard,
   **Then** the preferences summary card reflects the updated values.
3. **Given** I navigate away from the preferences editor without saving, **When** I return to the
   dashboard, **Then** the preferences summary card still shows the previously saved values.

---

### User Story 3 — Pause or Resume Newsletter Delivery (Priority: P2)

As a signed-in user, I want to pause and resume my newsletter delivery from the dashboard so I can
take a break without losing my saved preferences or having to re-do onboarding.

**Why this priority**: User control over delivery is a first-class constitutional requirement under
Principle IV. Pause/resume is the primary reversible form of that control and must be surfaced
prominently in the dashboard alongside the preferences summary.

**Independent Test**: Can be fully tested by toggling delivery off from the dashboard, confirming
`preferences.newsletterEnabled` is set to `false`, running a delivery job fixture, confirming no
email is dispatched, then toggling delivery back on and confirming the next job processes the user
normally.

**Acceptance Scenarios**:

1. **Given** my newsletter delivery is active, **When** I click "Pause Newsletter" on the dashboard,
   **Then** `preferences.newsletterEnabled` is set to `false`, the dashboard control updates to show
   "Paused", and no further newsletters are sent in subsequent delivery runs.
2. **Given** my newsletter delivery is paused, **When** I click "Resume Newsletter" on the dashboard,
   **Then** `preferences.newsletterEnabled` is set to `true`, the dashboard control updates to show
   "Active", and delivery resumes from the next scheduled run.
3. **Given** I pause or resume delivery, **When** I reload the dashboard,
   **Then** the displayed delivery state is consistent with the current stored value.
4. **Given** I pause delivery, **When** I inspect my saved preferences,
   **Then** my topics, region, and delivery time remain unchanged.
5. **Given** the email-delivery unsubscribe footer link is followed and confirmed,
   **When** I return to the dashboard, **Then** the dashboard shows delivery as Paused, reflecting
   the `newsletterEnabled: false` change applied by the email-delivery unsubscribe flow
   (defined in `specs/features/email-delivery/spec.md` FR-EMAIL-005).

---

### User Story 4 — View and Access Past Newsletters (Priority: P2)

As a signed-in user, I want to browse my newsletter history and open past issues in a web view so
I can re-read earlier content I may have missed or deleted from my inbox.

**Why this priority**: Newsletter history is a key visibility mechanism that complements the
preferences summary and increases the perceived value of the dashboard. It relies on `email_logs`
data already produced by the email-delivery pipeline.

**Independent Test**: Can be fully tested by seeding `email_logs` records for a user with varying
statuses (sent, skipped, failed), opening the dashboard, and confirming each row shows the correct
date and status, and that rows with status `sent` and an available web version link show a working
"View" link.

**Acceptance Scenarios**:

1. **Given** I have `email_logs` records across multiple dates, **When** I view the newsletter
   history list, **Then** entries are shown in reverse-chronological order showing date and delivery
   status for each.
2. **Given** a newsletter was delivered with `status: sent` and a web-readable version is available,
   **When** I click the "View" link on that row, **Then** I am taken to the web-readable version of
   that specific newsletter.
3. **Given** a newsletter has `status: failed` or `status: skipped`, **When** I view that row,
   **Then** the status is shown clearly and no broken or non-functional "View" link is displayed.
4. **Given** the history list spans more items than fit on a single page, **When** the list renders,
   **Then** pagination or a load-more control is provided so I can access older history entries.

---

### User Story 5 — Manage My Profile and Plan (Priority: P2)

As a signed-in user, I want a top-right profile menu and profile page where I can update my name,
picture, password, and plan details so account management feels easy to find after login.

**Why this priority**: Profile access is a primary navigation expectation for authenticated apps.
It also gives users a clear place to inspect billing state without hunting through settings.

**Independent Test**: Can be fully tested by signing in, opening the top-right profile menu,
navigating to the profile page, saving profile fields, changing a password, and confirming the plan
summary remains visible.

**Acceptance Scenarios**:

1. **Given** I am signed in, **When** I view the top-right navigation area, **Then** I see my
   profile identity, picture or initials, and current plan state.
2. **Given** I open the profile menu, **When** the menu expands, **Then** I can reach My Profile,
   My Plan, Preferences, Newsletter Delivery, and Sign Out without losing my session.
3. **Given** I am on the profile page, **When** I update my display name, headline, location, or
   picture URL and save, **Then** the profile preview and top-right menu reflect the updated
   identity.
4. **Given** I upload a local picture, **When** the preview loads and I save the profile, **Then**
   the picture is retained for the signed-in user's Daily Paper profile.
5. **Given** I enter a weak or mismatched new password, **When** I submit the password form,
   **Then** I see a safe, product-friendly validation message.
6. **Given** I enter a valid matching new password, **When** the password change succeeds, **Then**
   the form clears and I see a success confirmation.
7. **Given** the identity provider requires recent login for password changes, **When** I submit
   the password form, **Then** I am told to sign out and sign back in without exposing provider
   internals.

---

### User Story 6 — Account Settings: Logout and Delete Account (Priority: P3)

As a signed-in user, I want to log out of my session or permanently delete my account from the
dashboard so I retain full control over my presence in the product.

**Why this priority**: Logout is a baseline session-management requirement. Account deletion is a
constitutional obligation under Principle IV (consent is reversible at any time), scoped as an
optional MVP capability with explicit data-retention implications.

**Independent Test**: Logout can be fully tested by clicking "Log Out", confirming the session is
invalidated, and verifying the user is redirected to the public site. Delete account requires a
separate test confirming the two-step confirmation flow, the queuing of user-data deletion, and the
immediate revocation of session access.

**Acceptance Scenarios**:

**Logout**:

1. **Given** I am signed in, **When** I click "Log Out" in account settings,
   **Then** my authenticated session is invalidated and I am redirected to the public home page.
2. **Given** I have logged out, **When** I attempt to navigate to the dashboard,
   **Then** I am redirected to the login screen.

**Delete Account** *(Optional MVP — clearly scoped)*:

3. **Given** I initiate account deletion, **When** the confirmation dialog opens,
   **Then** I am shown a clear summary of what will be deleted and a warning that the action is
   permanent.
4. **Given** I confirm account deletion, **When** the deletion is accepted,
   **Then** my session is immediately invalidated, my account is marked for deletion, and I receive
   a confirmation email that my data will be removed within the stated retention period.
5. **Given** I initiate account deletion, **When** I dismiss or cancel the dialog,
   **Then** no data is changed and I remain on the dashboard.

---

### Edge Cases

- What happens when `email_logs` contains no records for the user? The history section must show a
  clean empty state without errors.
- What happens when the dashboard is accessed with an expired or missing session token? The system
  must redirect to login and return the user to the dashboard after re-authentication.
- What happens when the preferences summary cannot load because the Preferences API is unavailable?
  The dashboard must show a graceful degraded state indicating the summary could not be retrieved,
  without logging out the user.
- What happens when the user has `newsletterEnabled: false` because email-delivery processed an
  unsubscribe, but the user did not pause delivery themselves? The dashboard must display the paused
  state accurately regardless of which flow caused it.
- What happens when the user clicks "View" for a newsletter whose web version has expired or been
  removed? The link must show an appropriate not-available message rather than a broken page.
- What happens when the user's account is blocked mid-session? The next protected dashboard request
  must return an access-denied response and invalidate the session.
- What happens when account deletion is confirmed but the back-end deletion job has not yet
  completed? The user must see a clear in-progress state and must not be able to log back in once
  deletion is confirmed.
- What happens when the history list is very long? Pagination or progressive loading must prevent
  page performance degradation regardless of history volume.
- What happens when the user pauses delivery and immediately navigates away before the API response
  returns? The UI must not show a stale delivery state upon return; it must reflect the confirmed
  stored value.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-DASH-001**: The system MUST display a preferences summary card on the dashboard home showing
  the authenticated user's active topics (count or list), region, delivery time, and current
  newsletter delivery state (active or paused).
- **FR-DASH-002**: The system MUST include an "Edit Preferences" link in the preferences summary
  card that navigates the user to the preferences editor defined in
  `specs/features/onboarding-preferences/spec.md`.
- **FR-DASH-003**: The system MUST display a newsletter history list showing the last N days of
  `email_logs` records for the authenticated user, where N defaults to 30 days and is configurable.
  Each row MUST show newsletter date and delivery status (sent / failed / skipped).
- **FR-DASH-004**: The system MUST show a "View" link on newsletter history rows where delivery
  `status` is `sent` and a web-readable version is available; rows without an available web version
  MUST NOT display a non-functional link.
- **FR-DASH-005**: The system MUST provide a pause/resume delivery control on the dashboard that
  sets `preferences.newsletterEnabled` to `true` or `false` and immediately reflects the change in
  the displayed delivery state.
- **FR-DASH-006**: The system MUST show an empty state in the newsletter history section when no
  `email_logs` records exist for the user.
- **FR-DASH-007**: The system MUST show an empty state or a clear onboarding prompt in the
  preferences summary card when no preferences have been saved yet.
- **FR-DASH-008**: The system MUST provide a "Log Out" action in the account settings section that
  calls the auth logout endpoint, invalidates the authenticated session, and redirects the user to
  the public home page in accordance with `spec/features/authentication-consent/spec.md`
  FR-AUTH-006.
- **FR-DASH-009**: The system MUST reflect a `newsletterEnabled: false` state applied by the
  email-delivery unsubscribe flow (FR-EMAIL-005) as Paused on the dashboard the next time the
  dashboard is loaded.
- **FR-DASH-010**: The system MUST scope all dashboard data queries to the authenticated user's
  identity; cross-user data access MUST be impossible by design.
- **FR-DASH-011 (Optional MVP)**: The system SHOULD provide a delete account action behind a
  two-step confirmation dialog that clearly states what data will be removed and that the action is
  permanent. On confirmation, the system MUST immediately invalidate the user's session, mark the
  account for deletion, and send a deletion confirmation email. The feature MUST document the
  data-retention window during which personal data will be fully removed following account deletion.
- **FR-DASH-012**: The history list MUST support pagination or progressive loading to prevent
  performance degradation for users with large history volumes.
- **FR-DASH-013**: The system MUST expose the endpoints required by this feature:
  `GET /api/dashboard` (returns preferences summary and delivery state for the signed-in user),
  `GET /api/dashboard/history` (returns paginated newsletter history for the signed-in user),
  `DELETE /api/account` (optional MVP — initiates account deletion for the signed-in user).
- **FR-DASH-014**: The authenticated navigation MUST include a top-right profile menu showing the
  signed-in user's display identity, avatar or initials, and current plan state.
- **FR-DASH-015**: The profile menu MUST provide direct links to My Profile, My Plan, Preferences,
  Newsletter Delivery, and Sign Out.
- **FR-DASH-016**: The profile page MUST allow the signed-in user to update display name, headline,
  location, and profile picture URL or local preview while scoping saved profile data to that user.
- **FR-DASH-017**: The profile page MUST expose the current billing plan/trial state and link to
  the billing page.
- **FR-DASH-018**: The profile page MUST provide password change validation for minimum password
  length, confirmation mismatch, successful update, and recent-login-required errors using safe
  user-facing messages.
- **FR-DASH-019**: Authenticated navigation MUST include a My Paper destination that routes to the
  in-app personalized paper reader defined by the Newsletter Generation feature.
- **FR-DASH-020**: Authenticated users MUST be able to open a Plus paper preview from dashboard
  home and billing so they can inspect the paid newsletter format before subscribing.

### Security & Privacy Requirements *(mandatory)*

- The dashboard and all its API endpoints MUST require a valid authenticated session from the Auth
  dependency (`specs/features/authentication-consent/spec.md`). Any request without a valid session
  MUST be rejected with a redirect to login; no dashboard data MUST ever be served to an
  unauthenticated caller.
- All data returned by the dashboard APIs MUST be scoped to the authenticated user's identity. The
  system MUST enforce user-level access control at the data layer, not only at the routing layer,
  so that manipulation of request parameters cannot expose another user's preferences, history, or
  account state.
- The pause/resume action and the preferences edit link MUST both check that the session belongs to
  the owner of the affected preference record before accepting the change.
- The delete account flow MUST require a two-step confirmation to prevent accidental or malicious
  destruction of user data. A single API call without confirmed intent MUST be rejected.
- Account deletion MUST trigger an immediate session invalidation; the deleted account MUST NOT be
  accessible for login or dashboard access after confirmation, even during the data-retention period.
- The data-retention period for deleted accounts MUST be stated explicitly in the confirmation
  dialog and in the deletion confirmation email so users have a clear expectation of when their
  personal data will be fully removed.
- `email_logs` data surfaced in the history list MUST be filtered to structural fields only
  (date, delivery status, skip reason where non-sensitive) in accordance with the privacy
  constraints defined in `specs/features/email-delivery/spec.md`; rendered newsletter HTML, email
  body content, and raw provider data MUST NOT be surfaced on the dashboard.
- All security-relevant dashboard actions (session load, logout, pause/resume, delete account
  initiation, delete account confirmation) MUST be auditable without exposing personal or session
  secrets in log payloads.
- Session cookies or tokens used to protect the dashboard MUST conform to the HttpOnly, Secure, and
  SameSite requirements established in the Auth feature.

### Experience & Content Integrity Requirements *(mandatory)*

- The dashboard MUST feel modern, bright, minimal, and premium in readability, consistent with the
  Daily Paper constitution Design and Product Standards.
- The dashboard home layout MUST use a 12-column grid on desktop; on mobile it MUST stack cleanly
  with no horizontal scrolling.
- The preferences summary card and the newsletter history list MUST use the constitution-defined
  card component style: minimal shadow, disciplined spacing, and consistent with other card
  surfaces in the product.
- The "Pause Newsletter" and "Resume Newsletter" controls MUST use the destructive or secondary
  button treatment respectively, with a clear selected state change on confirmation; they MUST be
  visually distinguishable from the primary "Edit Preferences" link.
- The "Delete Account" button MUST use the explicit destructive button style defined in the
  constitution to prevent ambiguity about the severity of the action.
- The empty state for newsletter history and for the preferences summary (when no preferences are
  saved) MUST follow the constitution's content-first, clear, and inviting empty-state pattern.
- Typography MUST pair a high-contrast serif headline for section titles with a clean sans-serif for
  list and form content, preserving the strong hierarchy required by the design system.
- Motion MUST stay within the constitutional 150–250 ms window and MUST communicate state (e.g.,
  delivery toggle transition) rather than decoration.
- The dashboard MUST be accessible: keyboard navigation MUST work across all controls, visible focus
  states MUST be present, and WCAG AA contrast MUST be met for all text and interactive elements.
- Navigation MUST provide a clearly sectioned authenticated-user menu consistent with the overall
  navigation pattern defined in the Design System feature
  (`specs/features/design-system/spec.md`).

### Observability & Telemetry Requirements *(mandatory)*

- The feature MUST emit privacy-safe product events for the following: `dashboard.viewed`,
  `dashboard.preferences_card_viewed`, `dashboard.history_list_viewed`,
  `preferences.edit_link_clicked`, `newsletter.paused`, `newsletter.resumed`,
  `account.logout_initiated`, `account.delete_initiated`, and `account.delete_confirmed`.
- Events MUST NOT include email addresses, raw preference values, newsletter content, or any PII
  beyond opaque internal identifiers (userId reference) and action timestamps.
- The feature MUST emit error signals for: preferences summary load failure, history list load
  failure, pause/resume API failure, and delete account API failure, each including a sanitised
  error code and a timestamp but no personal data.
- Aggregate metrics MUST be sufficient to compute: dashboard daily active views, pause/resume
  rate, edit-preferences click-through rate, and delete account initiation and completion rates.
- The observability layer MUST allow operational teams to detect dashboard rendering failures,
  history API errors, and auth redirect loops without accessing personal data or session tokens.

### Key Entities *(include if feature involves data)*

- **Dashboard View**: The assembled data payload for one authenticated user's dashboard home,
  composed of a preferences summary and a paginated newsletter history. Not a stored entity — this
  is a read-time composition of the Preference Profile and the user's email_logs records.

- **Preference Summary**: A read-only projection of the user's saved preferences for display on the
  dashboard. Contains active topics (count or list), region, delivery time, and
  `newsletterEnabled` state. Owned by the Onboarding + Preferences feature
  (`specs/features/onboarding-preferences/spec.md`).

- **Newsletter History Entry**: One row in the history list. Derived from an `email_logs` record.
  Fields surfaced on the dashboard: newsletter date, delivery status, and — where status is `sent`
  and a web version is available — a link to the web-readable version. Owned by the Email Delivery
  feature (`specs/features/email-delivery/spec.md`).

- **Delivery State Control**: The dashboard-level representation of `preferences.newsletterEnabled`.
  Surfaces as an Active/Paused toggle. Changes to this control are persisted via the Preferences API
  (`PUT /api/preferences`) defined in `specs/features/onboarding-preferences/spec.md`.

- **Account Settings**: The collection of session-level actions available from the dashboard:
  logout (backed by `POST /api/auth/logout` from `specs/features/authentication-consent/spec.md`)
  and the optional MVP delete-account action (`DELETE /api/account`).

- **User (reference)**: Not owned by this feature. See
  `specs/features/authentication-consent/spec.md`. Relevant fields: `id`, `isVerified`, `status`.

- **Preferences (reference)**: Not owned by this feature. See
  `specs/features/onboarding-preferences/spec.md`. Relevant fields: `topics`, `region`,
  `deliveryTime`, `newsletterEnabled`, `updatedAt`.

- **email_logs (reference)**: Not owned by this feature. See
  `specs/features/email-delivery/spec.md`. Relevant fields: `newsletterId`, `status`, `skipReason`,
  `createdAt`.

---

## Test Plan

- **Unit coverage**: Validate dashboard data scoping (user can never see another user's data),
  pause/resume state transitions, empty-state rendering conditions, delete-account confirmation
  flow guards, and session-required redirects.
- **Integration coverage**: Validate `GET /api/dashboard` for a user with preferences and history,
  for a user with no preferences, and for a user with no history; validate `GET /api/dashboard/history`
  with pagination; validate the pause/resume action via `PUT /api/preferences`; validate logout via
  `POST /api/auth/logout`; validate `DELETE /api/account` (optional MVP).
- **End-to-end coverage**: Validate the full login → dashboard loads → preferences summary displayed
  scenario; validate edit-preferences link navigates to the preferences editor and updated values
  appear on return; validate pause and resume delivery from the dashboard; validate the unsubscribe
  email-footer flow terminates at the dashboard showing Paused state; validate the top-right profile
  menu exposes account destinations; validate profile edits, plan visibility, and password validation;
  validate logout redirects to the public home page.
- **Security testing**: Validate that unauthenticated requests to all dashboard endpoints return a
  redirect, not data; validate that a user cannot access another user's history by manipulating
  request parameters; validate that delete-account requires two-step confirmation and cannot be
  triggered by a single API call.
- **Accessibility review**: Validate keyboard navigation across all dashboard controls, visible
  focus states, screen-reader label clarity, and WCAG AA contrast for the preferences card,
  history list, and account settings section.
- **Regression coverage**: Validate that pausing delivery does not alter preferences values; validate
  that the history list reflects newly added `email_logs` records after a delivery run; validate that
  a `newsletterEnabled: false` change from the email-delivery unsubscribe flow appears as Paused the
  next time the dashboard is loaded.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of representative signed-in users can load the dashboard home, read their
  preferences summary, and navigate to the preferences editor within 2 minutes of signing in.
- **SC-002**: 100% of authenticated dashboard requests return only data belonging to the
  requesting user; cross-user data exposure has a zero-tolerance failure rate.
- **SC-003**: 100% of pause and resume actions are reflected in the dashboard delivery state on the
  same page session without requiring a full page reload.
- **SC-004**: 100% of unsubscribe confirmations processed by the email-delivery pipeline are
  reflected as Paused on the dashboard at the user's next dashboard load.
- **SC-005**: At least 95% of representative users can identify and use the pause/resume control
  within 30 seconds of opening the dashboard.
- **SC-006**: The newsletter history list renders within the expected time budget for users with up
  to 365 days of history, without pagination or performance degradation.
- **SC-007**: 100% of delete-account confirmations result in immediate session invalidation and
  the account becoming inaccessible for login; no personal data query succeeds after confirmation.
- **SC-008**: 100% of approved mobile dashboard layouts are readable and actionable without
  horizontal scrolling.

---

## Assumptions

- The Auth feature already provides a validated session mechanism, and the dashboard relies on it
  without reimplementing authentication or session management.
- The Onboarding + Preferences feature owns the preferences editor screen; the dashboard only
  provides the entry-point link and reads the saved result.
- The Email Delivery feature owns `email_logs` records; the dashboard reads them as a reference
  but does not write to or mutate them.
- The newsletter history period defaults to 30 days for Phase 1; this value will be made
  configurable before reaching general availability.
- A web-readable version URL for past newsletters is assumed to be available as a field on the
  `newsletters` record or derivable from it; this dependency is noted as a Phase 1 assumption and
  may require coordination with the Newsletter Generation feature.
- Delete account is scoped as an optional MVP capability: it MUST be specced and designed in Phase
  1 but MAY be deferred to a fast-follow release if schedule pressure requires it. The physical
  deletion job and its retention window MUST be defined before the feature ships.
- The data-retention period following account deletion is assumed to be 30 days for Phase 1 pending
  legal and compliance review; the actual period MUST be confirmed before the delete-account flow
  is released to users.
- The Design System feature provides the card, button, chip, navigation, and empty-state component
  patterns used here; no new component behaviour is introduced by this feature without a design
  exception.
- The dashboard is not a public page; all routes under the dashboard path MUST be protected by the
  session gate from the Auth feature.
- Mobile layouts are in scope for Phase 1; a dedicated native application is not.
