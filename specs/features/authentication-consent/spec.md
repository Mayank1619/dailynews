# Feature Specification: Authentication + Consent

**Feature Branch**: `[authentication-consent]`

**Created**: 2026-05-26

**Status**: Complete

**Input**: User description: "Feature: Authentication + Consent. Goal: Allow users to securely register/login and capture explicit consent preferences. Scope Phase 1 includes signup, login/logout, email verification, password reset, consent capture and storage, rate limiting and brute force protection, and blocked user enforcement. Preserve the provided API, data model, acceptance criteria, tests, and align the feature with the Daily Paper constitution."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Signup with Explicit Consent (Priority: P1)

As a new user, I want to register with email and password, verify my email, and choose optional product communications so I can create an account and control what I receive.

**Why this priority**: Account creation and consent capture are the entry point for the entire authenticated experience and the core trust requirement for this feature.

**Independent Test**: Can be fully tested by creating a new account with a valid email and password, confirming the consent selections are stored correctly, and verifying that the account remains restricted until email verification is completed.

**Acceptance Scenarios**:

1. **Given** I am a new visitor, **When** I submit signup with a valid email and password, **Then** the system creates my account, stores only a hashed password, and records my consent choices with a timestamp and terms version.
2. **Given** I leave optional product updates and offers unchecked, **When** I complete signup, **Then** the stored consent record shows those optional preferences as false.
3. **Given** I have not verified my email, **When** I attempt to use any newsletter-related capability, **Then** the system does not treat me as verified for newsletter delivery.
4. **Given** I prefer a social account, **When** I choose Google or Facebook from signup, **Then** the system starts Firebase provider sign-in and records the same newsletter consent choices before sending me to onboarding.

---

### User Story 2 - Login, Logout, and Password Recovery (Priority: P2)

As a registered user, I want to sign in securely, sign out cleanly, and recover access if I forget my password so I can keep using my account without creating a new one.

**Why this priority**: Returning users need a reliable access path, and password recovery prevents account loss while preserving security expectations.

**Independent Test**: Can be fully tested by signing in with a verified account, signing out, requesting a password reset, and completing the reset with a valid time-limited token.

**Acceptance Scenarios**:

1. **Given** I have a verified account, **When** I submit valid login credentials, **Then** I am granted a secure authenticated session.
2. **Given** I am signed in, **When** I log out, **Then** my session is invalidated and I can no longer use it to remain authenticated.
3. **Given** I request a password reset, **When** I enter an email address, **Then** the response does not reveal whether that email exists and a time-limited reset token is used if the account is valid.
4. **Given** I use a valid reset token before it expires, **When** I set a new password, **Then** I regain access using the new password and the old reset token cannot be reused.
5. **Given** I sign in with email, Google, or Facebook, **When** authentication succeeds, **Then** I am routed to the account settings area where I can manage preferences and newsletter subscription state.

---

### User Story 3 - Blocked Account Enforcement (Priority: P3)

As an admin, I want blocked users to be prevented from signing in or receiving newsletters so I can protect the service when necessary.

**Why this priority**: Access control is a critical safety requirement, but it is a downstream control relative to account creation and normal access.

**Independent Test**: Can be fully tested by marking an account blocked and confirming the user cannot sign in and is excluded from newsletter delivery.

**Acceptance Scenarios**:

1. **Given** an account status is blocked, **When** the user tries to log in, **Then** access is denied and the user sees a blocked-account message.
2. **Given** an account status is blocked, **When** newsletters are prepared, **Then** the blocked account is excluded from delivery.
3. **Given** an admin blocks or unblocks an account through the connected dashboard workflow, **When** the status changes, **Then** the login and delivery rules immediately reflect the new status.

### Edge Cases

- What happens when a signup email already exists? The system must reject the duplicate account attempt without exposing additional personal data.
- What happens when a password is too weak or the email format is invalid? The system must show a clear validation error and prevent account creation.
- What happens when verification or reset tokens expire, are replayed, or are tampered with? The system must reject the request and require a fresh token.
- What happens when a user requests password recovery for a blocked account? The account remains blocked and must still be denied access until unblocked by an admin.
- What happens when optional consent boxes are left unchecked? Those preferences must be stored as false and must not prevent completion of the feature’s allowed flow.
- What happens when the consent terms version changes? Stored records must preserve the version accepted at the time of signup for auditability.
- What happens when email delivery fails for verification or reset messages? The user must receive a clear recovery path without leaking account existence.
- What happens when a rate limit threshold is reached? The system must slow or deny additional attempts without revealing whether the account is valid.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-AUTH-001**: The system MUST require an email address and password for signup.
- **FR-AUTH-002**: The system MUST store only a hashed password and MUST never retain a plaintext password.
- **FR-AUTH-003**: The system MUST require email verification before a user is treated as verified for newsletter delivery.
- **FR-AUTH-004**: The system MUST support password reset using a time-limited token.
- **FR-AUTH-005**: The system MUST establish a secure authenticated session on successful login.
- **FR-AUTH-006**: The system MUST end the authenticated session on logout so the session cannot continue to be used.
- **FR-AUTH-011**: The web experience SHOULD expose Firebase-backed Google and Facebook sign-in options alongside email/password where those providers are enabled in Firebase Authentication.
- **FR-AUTH-012**: Successful signup MUST route the user into onboarding, and successful login MUST route the user into an authenticated account settings or dashboard surface.
- **FR-CONS-001**: The system MUST capture consent choices at signup for newsletter, product updates, and offers/promotions, with product updates and offers/promotions treated as optional and newsletter consent recorded explicitly.
- **FR-CONS-002**: The system MUST persist consent flags, a timestamp, and the accepted terms version for each signup.
- **FR-AUTH-007**: The system MUST prevent blocked users from logging in and MUST exclude blocked users from newsletter delivery.
- **FR-AUTH-008**: The system MUST rate limit login and recovery attempts to reduce brute force abuse.
- **FR-AUTH-009**: The system MUST validate and sanitize incoming authentication and consent inputs before processing them.
- **FR-AUTH-010**: The system MUST provide the backend contract endpoints required by the feature: POST /api/auth/signup, POST /api/auth/login, POST /api/auth/logout, POST /api/auth/verify-email, POST /api/auth/forgot-password, POST /api/auth/reset-password, and GET /api/auth/me.

### Security & Privacy Requirements *(mandatory)*

- Passwords MUST be hashed with a modern adaptive algorithm such as bcrypt or argon2 before storage.
- Login attempts MUST be rate-limited per IP and per user identity to reduce brute-force abuse.
- Password reset responses MUST not reveal whether an email address exists.
- If cookie-based sessions are used, cookies MUST be HttpOnly, Secure, and SameSite.
- The feature MUST collect only the minimum account and consent data required to operate the service.
- Consent records MUST be explicit, auditable, versioned against the applicable terms text, and retained for compliance review.
- Consent choices MUST be reversible through the connected user dashboard workflow, and each change MUST preserve history with a timestamp and accepted terms version.
- Users who have not verified their email MUST not be treated as eligible for newsletters.
- Blocked users MUST not receive newsletters and MUST not be able to regain access until their status is changed by an authorized admin workflow.
- Validation errors and blocked-account responses MUST be understandable to users but MUST not leak unnecessary account state.
- Security-sensitive events such as signup, verification, login success or failure, password reset, logout, and blocked access MUST be auditable without exposing secrets.

### Experience & Content Integrity Requirements *(mandatory for user-facing features)*

- Signup and login screens MUST follow the Daily Paper constitution: modern, bright, minimal, premium in readability, and content-first.
- Forms MUST use clear labels, plain-language helper text, and readable consent controls that are never hidden behind marketing copy.
- Optional consent choices MUST be visually distinct from the required account and service flow.
- Blocked-account messaging MUST be direct, neutral, and non-technical.
- Verification and password recovery messages MUST be trustworthy, concise, and free of sensational or misleading language.
- The user experience MUST preserve visible focus states, keyboard access, and WCAG AA contrast expectations.
- Any references to newsletter, updates, or offers MUST clearly describe what the user is choosing and MUST not imply hidden tracking.

### Observability & Telemetry Requirements *(mandatory)*

- The system MUST emit privacy-safe events for signup attempt, signup success, verification sent, email verified, login success, login failure, logout, password reset requested, password reset completed, consent captured, and blocked-access denied.
- The system MUST support aggregate visibility into rate-limit and blocked-account enforcement without storing passwords, reset tokens, or other secrets in telemetry.
- Operational reporting MUST be sufficient to identify broken signup, verification, or recovery flows without exposing personal data.

### Data Requirements *(mandatory)*

- **users**: `id`, `email`, `passwordHash`, `isVerified`, `status(active|blocked)`, `role(user|admin)`, `createdAt`
- **consents**: `userId`, `newsletter(boolean required)`, `productUpdates(boolean)`, `offers(boolean)`, `timestamp`, `termsVersion`
- The stored consent record MUST remain associated with the user account and the accepted version of the terms or consent text.
- The system MUST retain enough account history to distinguish a current active user from a blocked user.

### API Contract *(mandatory)*

- **POST /api/auth/signup**: Creates a new account, captures consent choices, stores the hashed password, and initiates email verification.
- **POST /api/auth/login**: Authenticates a verified, unblocked user and starts a secure session.
- **POST /api/auth/logout**: Ends the current authenticated session.
- **POST /api/auth/verify-email**: Confirms a user’s email address using a verification token.
- **POST /api/auth/forgot-password**: Accepts a reset request without revealing whether the email exists.
- **POST /api/auth/reset-password**: Completes a password change using a valid time-limited token.
- **GET /api/auth/me**: Returns the current authenticated account context when a valid session exists.

### Key Entities *(include if feature involves data)*

- **User Account**: Represents a person’s authentication profile, verification state, account status, and role.
- **Consent Record**: Captures the user’s newsletter, product updates, and offers choices along with the accepted terms version and timestamp.
- **Verification Token**: A short-lived credential used to confirm control of the email address.
- **Password Reset Token**: A short-lived credential used to authorize password recovery.
- **Session**: The authenticated state that allows a verified user to remain signed in until logout or expiration.

## Test Plan

- **Unit coverage**: Validate password hashing, email and password validation, consent persistence, blocked-user checks, and token expiry logic.
- **Integration coverage**: Validate the signup, login, logout, email verification, forgot-password, reset-password, and current-user endpoints end to end.
- **Security coverage**: Validate rate limiting, blocked-user enforcement, password reset non-enumeration, and session invalidation.
- **End-to-end coverage**: Validate the signup flow, invalid password handling, email verification path, password reset path, and blocked user login path in a browser.
- **Data integrity review**: Validate that consent records store the expected flags, timestamp, and terms version, and that optional consents default to false when unchecked.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of successful signups in test runs store a hashed password, a consent record, and the accepted terms version without retaining plaintext passwords.
- **SC-002**: 100% of password reset requests return the same user-facing outcome regardless of whether the email address exists.
- **SC-003**: 100% of tested blocked accounts are denied login and excluded from newsletter delivery.
- **SC-004**: At least 95% of representative users can complete signup, verification, and first login on the first attempt during usability review.
- **SC-005**: 100% of tested optional consent combinations preserve the user’s choices exactly as selected, including unchecked offers and product updates stored as false.
- **SC-006**: In review testing, 100% of verified users can log out and have the session invalidated successfully.

## Assumptions

- The existing User Dashboard dependency will provide the admin workflow for blocking or unblocking users and, where needed, future consent management views.
- Multi-factor authentication and account recovery beyond the listed password reset flow are out of scope for Phase 1. Social login is supported through Firebase Auth providers when the provider configuration is enabled in Firebase.
- Newsletter delivery itself is outside this spec except for the verification and blocked-user gating rules.
- Terms and consent text versions are supplied by product or governance owners and will be recorded alongside each consent event.
- The authentication experience must remain consistent with the Daily Paper constitution and the existing design-system rules for layout, contrast, motion, and accessibility.

## Implementation Pass Confirmation (2026-05-26)

- Scope confirmed for this pass: Phase 1 setup, Phase 2 foundational work, and User Story 1 (P1) only.
- Dependency baseline confirmed: Firebase Auth client bootstrap for web signup, Firebase Admin ID-token verification for API identity binding, and privacy-safe consent telemetry/audit hooks.

## Implementation Update (2026-06-02)

- Confirmed the Vite web app uses Firebase Auth client SDK for email/password signup, login, sign-out, and password reset.
- Confirmed `/api/auth/signup` is implemented as a Vercel serverless function that verifies the Firebase ID token through Firebase Identity Toolkit token lookup before recording consent.
- Confirmed the Vercel signup function can use the Firebase web API key for token lookup, avoiding a service-account key for this consent-binding path.
- Confirmed missing Firebase web configuration produces a user-facing setup message instead of exposing raw internal environment-variable errors.
- Deferred the remaining HTTP auth endpoints (`/api/auth/login`, `/api/auth/logout`, `/api/auth/verify-email`, `/api/auth/reset-password`, `/api/auth/me`) to the broader authenticated dashboard/API phase because login/logout/reset currently use the Firebase client SDK directly.

## Implementation Update (2026-06-02, Post-Auth Routing)

- Confirmed signup now redirects authenticated users to `/onboarding` so preference setup starts immediately after account creation.
- Confirmed login now redirects authenticated users to `/settings`, which links to preference updates and newsletter subscription controls.
- Confirmed Google and Facebook provider buttons are present on signup and login, backed by Firebase popup sign-in; provider success depends on the corresponding Firebase provider configuration.

## Implementation Update (2026-06-02, Auth UX Polish)

- Confirmed login and signup now render as full-screen dark neon account surfaces rather than compact centered boxes.
- Confirmed Google and Facebook buttons appear below the primary email/password flow, with the login page showing the create-account prompt before social options.
- Confirmed account and public surfaces include a "Powered by Netfruit" footer link.

## Telemetry & Privacy Compliance

All telemetry events emitted by this feature are privacy-safe:

- **No passwords** are ever included in any telemetry payload.
- **No reset tokens** or session tokens appear in any event metadata.
- **No raw email addresses** are logged; email-derived identifiers are hashed (SHA-256, truncated to 16 hex chars) via `ConsentAuditService`.
- **Reason fields** in admin block/unblock events are sanitized to strip email-like patterns before emission.
- All events carry a `feature: "authentication-consent"` label, an `occurredAt` ISO timestamp, and a `status` of `"success"` or `"error"` — no secrets.

### Event Inventory

| Event name | US | Status values | Notes |
|---|---|---|---|
| `secure_signup_succeeded` | US1 | `success` | uid, source, termsVersion, consent flags |
| `secure_signup_failed` | US1 | `error` | source, reason (no PII) |
| `login_attempt` | US2 | `success` | source only |
| `login_success` | US2 | `success` | uid, source, emailVerified |
| `login_failure` | US2 | `error` | source, reason (no PII) |
| `logout` | US2 | `success` | uid, source |
| `password_reset_requested` | US2 | `success` | source only (non-enumeration) |
| `password_reset_completed` | US2 | `success` | source only |
| `blocked_access_denied` | US2/US3 | `error` | uid, source |
| `admin_blocked_account` | US3 | `success` | uid, adminUid, sanitized reason |
| `admin_unblocked_account` | US3 | `success` | uid, adminUid |
