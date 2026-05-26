# Feature Specification: Admin Dashboard (RBAC)

**Feature Branch**: `[admin-dashboard]`

**Created**: 2026-05-26

**Status**: Draft

**Owner**: POD Admin/Platform

**Dependencies**: Auth, Audit Logs, Sources, Blog, Analytics

**Input**: User description: "Feature: Admin Dashboard (RBAC). Goal: Give admins operational control over users, sources, blog, analytics, and exports. As an admin, I want to manage users and content sources and view system health. Phase 1 scope includes users, sources, blog, testimonials, analytics-lite, and consent-safe exports with strict RBAC and auditability."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Admin Access and Governance (Priority: P1)

As a platform administrator, I want exclusive access to admin capabilities with complete action auditing so privileged operations are controlled, traceable, and policy-compliant.

**Why this priority**: Without strict role gating and immutable action traceability, all other admin functionality creates security and compliance risk.

**Independent Test**: Can be fully tested by attempting to access `/admin` as admin and non-admin users, performing a privileged admin action, and verifying both access control outcomes and audit records.

**Acceptance Scenarios**:

1. **Given** a signed-in admin user, **When** they navigate to `/admin`, **Then** access is granted and all admin modules render.
2. **Given** a signed-in non-admin user, **When** they navigate to `/admin` or call an admin action, **Then** access is denied and the denied attempt is audit logged.
3. **Given** a signed-in admin user, **When** they perform a privileged action (for example block user, publish post, disable source, export list), **Then** an audit record is created with actor, action, target, outcome, and timestamp.

---

### User Story 2 - Manage Users and Consent State (Priority: P1)

As an administrator, I want to search and manage user accounts and inspect consent preferences so I can enforce policy and support operations safely.

**Why this priority**: User-state management and consent visibility are core operational controls and directly impact security, legal compliance, and email eligibility.

**Independent Test**: Can be fully tested by listing users, blocking/unblocking a target user, reviewing that user’s consent/profile preferences, and confirming expected outcomes.

**Acceptance Scenarios**:

1. **Given** an admin in the Users module, **When** they open the user list, **Then** each record shows account status and created date.
2. **Given** an admin viewing a user, **When** they block or unblock the account, **Then** the status updates and the action is audit logged.
3. **Given** an admin viewing a user profile, **When** they open consent details, **Then** current consent flags, recorded timestamp, and policy version are visible.

---

### User Story 3 - Manage Sources, Editorial Content, and Testimonials (Priority: P2)

As an administrator, I want to control source availability and editorial publishing so ingestion quality and public content can be governed from one panel.

**Why this priority**: Content quality and publishing operations are business-critical but depend on secure admin access controls already in place.

**Independent Test**: Can be fully tested by adding a source, toggling source status, creating/editing/publishing a blog post, and moderating testimonials while confirming each operation is audited.

**Acceptance Scenarios**:

1. **Given** an admin in Sources, **When** they add a new source with a valid endpoint, **Then** the source is saved and available for enable/disable control.
2. **Given** an admin in Blog management, **When** they create or edit and publish/unpublish a post, **Then** publication state changes successfully and is audit logged.
3. **Given** an admin in Testimonials, **When** they approve or remove a testimonial, **Then** testimonial state updates and is audit logged.

---

### User Story 4 - Export Consent-Safe Lists and Review Health Metrics (Priority: P2)

As an administrator, I want lightweight operational analytics and consent-filtered exports so outreach and platform checks remain compliant and actionable.

**Why this priority**: Export and analytics-lite support growth operations but must never violate consent or privacy guarantees.

**Independent Test**: Can be fully tested by viewing analytics-lite values and generating a consent-filtered CSV to confirm only opted-in users are included.

**Acceptance Scenarios**:

1. **Given** an admin in Analytics-lite, **When** they open the dashboard, **Then** they can view registrations, sends, and opens where available.
2. **Given** an admin generating an export for offers or product updates, **When** export completes, **Then** only users with matching active consent are included.
3. **Given** an admin downloads the export, **When** they open the CSV, **Then** each row includes email, consent flags, and signup date.

### Edge Cases

- A non-admin obtains a deep link to an admin sub-page; access is denied consistently and the attempt is logged.
- An admin session expires mid-action; the operation fails safely, no partial privileged write is committed, and the failure is logged.
- Source URL is syntactically invalid or unsupported; source creation is blocked with actionable validation feedback.
- Source endpoint becomes unreachable after being enabled; source status and failure reason are visible without exposing sensitive internals.
- Consent flags are missing, revoked, or outdated at export time; those users are excluded from export by default.
- Analytics open-rate data is unavailable from upstream; dashboard still renders with clear availability state rather than misleading values.
- Concurrent admins edit the same content; the system prevents silent overwrite and requires explicit conflict resolution.

## Requirements *(mandatory)*

### Functional Requirements

#### RBAC, Access Control, and Audit

- **FR-ADMIN-001**: The system MUST allow access to `/admin` only for users with an admin role.
- **FR-ADMIN-002**: The system MUST audit log every privileged admin action with at least actor identity, action type, target object, outcome, and timestamp.
- **FR-ADMIN-003**: The system MUST block and audit log all non-admin attempts to access admin routes or execute admin actions.
- **FR-ADMIN-004**: The system MUST enforce role checks for every admin capability at execution time, not only at navigation time.
- **FR-ADMIN-005**: The system MUST provide admins with a view of recent admin activity for operational traceability.

#### Users Module

- **FR-ADMIN-USR-001**: The system MUST provide a user list that includes account status and account created date.
- **FR-ADMIN-USR-002**: The system MUST allow admins to block and unblock user accounts.
- **FR-ADMIN-USR-003**: The system MUST allow admins to view each user’s consent and preference state, including consent timestamp and policy version when recorded.
- **FR-ADMIN-USR-004**: The system MUST prevent blocked users from successful login and protected-session continuation.
- **FR-ADMIN-USR-005**: The system MUST audit log user-status changes and consent-view access events.

#### Sources Module

- **FR-ADMIN-SRC-001**: The system MUST allow admins to add new RSS/API sources.
- **FR-ADMIN-SRC-002**: The system MUST allow admins to enable or disable each source.
- **FR-ADMIN-SRC-003**: The system MUST validate source URL format before creation or update.
- **FR-ADMIN-SRC-004**: The system MUST allow admins to edit source metadata used for operational identification.
- **FR-ADMIN-SRC-005**: The system MUST audit log add, edit, enable, and disable source actions.

#### Blog and Testimonials Module

- **FR-ADMIN-BLOG-001**: The system MUST allow admins to create and edit blog posts.
- **FR-ADMIN-BLOG-002**: The system MUST allow admins to publish and unpublish blog posts.
- **FR-ADMIN-BLOG-003**: The system MUST allow admins to manage blog tags and categories.
- **FR-ADMIN-BLOG-004**: The system MUST allow admins to approve and manage testimonials.
- **FR-ADMIN-BLOG-005**: The system MUST audit log blog and testimonial create, edit, publish-state, and moderation actions.

#### Analytics-lite and Export Module

- **FR-ADMIN-ANL-001**: The system MUST provide analytics-lite counters for registrations, newsletter sends, and opens when available.
- **FR-ADMIN-ANL-002**: The system MUST clearly indicate when a metric is unavailable rather than displaying inferred values.
- **FR-ADMIN-EXP-001**: The system MUST export emails filtered by consent where `offers = true` or `productUpdates = true`, based on the admin’s selected export mode.
- **FR-ADMIN-EXP-002**: The export output MUST include email, consent flags, and signup date for each included user.
- **FR-ADMIN-EXP-003**: The system MUST exclude users with missing, revoked, or false consent from corresponding marketing exports.
- **FR-ADMIN-EXP-004**: The system MUST audit log export requests and completion outcomes, including filter type and record count.

### Security & Privacy Requirements *(mandatory)*

- Admin authorization decisions MUST follow least-privilege RBAC and be enforced for all admin routes and action endpoints.
- Consent is a hard gate for export eligibility; users without explicit active opt-in MUST NOT be exported for outreach.
- Consent records used for export decisions MUST be explicit, auditable, and versioned against applicable policy text.
- Admin-facing surfaces MUST minimize exposure of personal data to only what is needed for the operational task.
- Audit logs MUST retain evidentiary fields for privileged actions while excluding secrets and sensitive credential material.
- Access-denied events and suspicious admin access patterns MUST be observable for security review.

### Experience & Content Integrity Requirements *(mandatory for user-facing features)*

- The admin dashboard MUST preserve clarity and fast task execution for operational workflows, with clear state labels for blocked users, source status, publication state, and consent-filtering outcomes.
- All destructive or high-impact actions (for example block user, disable source, publish-state change, export) MUST present unambiguous intent confirmation and outcome feedback.
- Blog and testimonial workflows MUST preserve trust and editorial integrity by ensuring state changes are explicit, attributable, and reversible through managed flows.

### Observability & Telemetry Requirements *(mandatory)*

- The system MUST emit audit and product-health events for admin login success/failure, access denials, user-status updates, source-state changes, blog publication-state changes, testimonial moderation, export requests, and export completion.
- Telemetry for admin workflows MUST remain privacy-safe and focused on operational reliability, security posture, and compliance outcomes.
- The dashboard MUST surface health indicators for dependency readiness (Auth, Audit Logs, Sources, Blog, Analytics) so admins can detect degraded services.
- Failures in privileged actions MUST be traceable end-to-end by correlation identifiers shared across operational logs.

### Key Entities *(include if feature involves data)*

- **AdminUser**: A privileged operator identity with role assignments used to authorize admin actions.
- **AuditEvent**: A tamper-evident activity record containing actor, action, target, timestamp, outcome, and contextual metadata.
- **ManagedUser**: A platform account visible in admin operations with lifecycle status, signup timestamp, and preference profile.
- **ConsentRecord**: User consent state for outreach and product updates, including flags, timestamp, and policy version.
- **ContentSource**: An RSS/API ingestion source with endpoint, status, and operational metadata.
- **BlogPost**: Editorial content with draft/published state, taxonomy metadata, and publication history.
- **Testimonial**: User-submitted or curated social-proof content with moderation state.
- **AnalyticsSnapshot**: Time-bound aggregate operational metrics shown in analytics-lite.
- **ConsentExportJob**: A tracked request and output artifact for consent-filtered email export with filter mode and record count.

## Test Plan

- **Unit tests**: RBAC authorization checks, route/action guards, consent filter logic for exports, source URL validation, and blocked-user login denial logic.
- **Integration tests**: Admin action audit-event generation for users, sources, blog, testimonials, and export flows; dependency fallback behavior for unavailable analytics metrics.
- **E2E tests**:
  1. Admin login -> open `/admin` -> block user -> blocked user login denied.
  2. Non-admin login -> attempt `/admin` and privileged action -> denied and logged.
  3. Admin export offers list -> opted-out users excluded.
  4. Admin export product-updates list -> only matching consented users included.
  5. Admin source add/edit/enable-disable and blog publish/unpublish flows complete with visible confirmations.
- **Security and privacy verification**: Validate that all privileged actions produce audit records and that export datasets never include users without matching active consent.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of tested non-admin attempts to access admin routes or admin actions are denied and recorded in audit logs.
- **SC-002**: 100% of tested privileged admin actions generate complete audit entries with actor, action, target, outcome, and timestamp.
- **SC-003**: 100% of consent-filtered export tests exclude users lacking matching active opt-in consent.
- **SC-004**: Administrators can complete the core Phase 1 operations (user status change, source toggle, blog publish-state change, testimonial moderation, export run) in a single session without blocked dependencies in at least 95% of validation runs.
- **SC-005**: Analytics-lite module displays available operational metrics and explicit unavailable states in 100% of test runs.

## Assumptions

- Existing authentication and role assignment infrastructure is available and can identify admin and non-admin users.
- Audit log infrastructure exists as a dependency and can store required privileged-action evidence fields.
- Consent flags (`offers`, `productUpdates`) and signup date are already available in user data models from earlier features.
- Export output is intended for operational use by authorized admins and follows existing privacy handling policies.
- Phase 1 includes a single admin role; finer-grained sub-roles are deferred to later phases.
