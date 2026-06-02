# Feature Specification: Onboarding + Preferences

**Feature Branch**: `[onboarding-preferences]`

**Created**: 2026-05-26

**Status**: Draft

**Input**: User description: "Feature: Onboarding + Preferences. Owner: POD Platform/Web. Dependencies: Auth, Design System. Goal: Collect user preferences to personalize the daily digest. User story: As a user, I want to select topics, region, and delivery time so that my newsletter matches my interests. Phase 1 scope includes topic selection, region selection with Canada default and optional province/city, delivery time selection in the user’s local time, save/update preferences, and an optional pause/resume newsletter toggle. Preserve the data model, API contract, validation, onboarding flow, mobile-friendly accessibility, and Daily Paper constitution alignment."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete First-Time Onboarding (Priority: P1)

As a signed-in user, I want to choose my topics, region, and delivery time during onboarding so my first digest reflects my interests right away.

**Why this priority**: This is the primary value of the feature and the first moment personalization becomes visible to the user.

**Independent Test**: Can be fully tested by signing in, completing onboarding, selecting at least one topic, choosing a region and delivery time, and confirming the saved preferences appear on the dashboard.

**Acceptance Scenarios**:

1. **Given** I am signed in and have no saved preferences, **When** I open onboarding, **Then** I see a clear empty state that invites me to choose topics, region, and delivery time.
2. **Given** I select at least one topic, a region, and a delivery time, **When** I save, **Then** the preferences are stored and the dashboard shows my selections.
3. **Given** I try to save without selecting any topics, **When** I submit the form, **Then** I see an error that requires me to choose at least one topic.
4. **Given** I finish signup, **When** authentication succeeds, **Then** I am sent directly into onboarding instead of being left on the signup page.

---

### User Story 2 - Update Preferences Anytime (Priority: P2)

As a returning user, I want to update my preferences after onboarding so my digest can evolve with my interests and location.

**Why this priority**: Ongoing preference changes are essential for long-term relevance and user control.

**Independent Test**: Can be fully tested by opening the saved preferences view, changing one or more fields, saving, and confirming the updated values persist.

**Acceptance Scenarios**:

1. **Given** I already have saved preferences, **When** I edit my topics, region, or delivery time, **Then** the new values replace the previous ones and remain visible after refresh.
2. **Given** I save a preference change, **When** the next digest is generated, **Then** the digest uses the updated preferences.
3. **Given** I update my preferences from the dashboard, **When** I return later, **Then** I see the latest saved selections.
4. **Given** I sign in as a returning user, **When** login succeeds, **Then** I land on an account settings hub that links to preference and newsletter controls.

---

### User Story 3 - Pause or Resume Delivery (Priority: P3)

As a user, I want to pause or resume my newsletter so I can temporarily stop delivery without losing my saved preferences.

**Why this priority**: This is a valuable control, but it is secondary to creating and maintaining the core preference profile.

**Independent Test**: Can be fully tested by toggling newsletter delivery off and on and confirming the saved preferences remain intact.

**Acceptance Scenarios**:

1. **Given** I have saved preferences, **When** I turn newsletter delivery off, **Then** my preferences remain saved and delivery is paused.
2. **Given** newsletter delivery is paused, **When** I turn it back on, **Then** delivery resumes using my saved preferences.
3. **Given** I revisit the preferences screen after pausing delivery, **When** I review the state, **Then** I can clearly see whether newsletter delivery is enabled.

### Edge Cases

- What happens when no topics are selected? The system must block saving and show a clear validation message.
- What happens when the user has never set preferences? The system must present a clean empty state and an obvious first action.
- What happens when the user changes time zones or travels? The delivery time must remain understandable in the user’s local time and be presented consistently.
- What happens when a province or city is not provided? The region must still save successfully with country-level selection only.
- What happens when the selected topic taxonomy changes later? Existing saved preferences must remain valid or be safely mapped to the closest available topic set.
- What happens when the user pauses delivery and later returns? The pause state must not erase saved topics, region, or delivery time.
- What happens when a preferences save occurs during signup or onboarding flow interruption? The user must be able to return and complete the flow without losing already entered values.
- What happens when the authenticated session is missing or expired? The system must require sign-in again before preferences can be viewed or updated.
- What happens when multiple preference updates occur within the same millisecond? The system must still produce a distinct, monotonic `updatedAt` value so audit and next-generation checks can observe the change.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-PREF-001**: The system MUST allow users to select 1..N topics from a predefined Daily Paper taxonomy.
- **FR-PREF-002**: The system MUST allow users to set a region using country plus optional province or city details.
- **FR-PREF-003**: The system MUST allow users to select a delivery time within the supported daily window and store it in the user’s local time.
- **FR-PREF-004**: The system MUST allow users to update preferences at any time after onboarding.
- **FR-PREF-005**: The system MUST apply preference changes to the next newsletter generation.
- **FR-PREF-006**: The system SHOULD provide a newsletterEnabled control that lets users pause and resume delivery without deleting saved preferences.
- **FR-PREF-007**: The system MUST require at least one topic before preferences can be saved.
- **FR-PREF-008**: The system MUST default the region to Canada and MUST allow optional province or city refinement.
- **FR-PREF-009**: The system MUST show the saved preference state on the dashboard after a successful save.
- **FR-PREF-010**: The system MUST preserve previously saved preferences when only one field is changed.
- **FR-PREF-011**: The system MUST keep the onboarding flow aligned with signup so the user can move from account creation to preferences setup without losing progress.
- **FR-PREF-012**: The system MUST expose the backend contract endpoints required by the feature: GET /api/preferences and PUT /api/preferences.
- **FR-PREF-013**: The system MUST update `updatedAt` monotonically on preference and onboarding-state changes, even when multiple updates happen within the same millisecond.
- **FR-PREF-014**: The authenticated web dashboard MUST provide direct controls for preference updates, newsletter unsubscribe/resubscribe, and delivery frequency or time changes.
- **FR-PREF-015**: User preference storage MUST be scoped to the authenticated user identity so accounts sharing a browser do not overwrite each other's dashboard choices.
- **FR-PREF-016**: Topic selection SHOULD expose grouped detailed interests, including politics, finance, AI, technology, sports subtopics, culture, horoscopes, and life categories, while preserving simple multi-select controls.
- **FR-PREF-017**: Users SHOULD be able to choose newsletter frequency from daily, weekdays, or weekly delivery.
- **FR-PREF-018**: Authenticated dashboard navigation MUST avoid public marketing/blog links that make users feel signed out; account pages SHOULD provide a back path to the dashboard.

### Security & Privacy Requirements *(mandatory)*

- The feature MUST only allow an authenticated user to read or update their own preferences through the Auth-provided session context.
- The feature MUST collect only the minimum preference data required to personalize the digest: topics, region, delivery time, and newsletterEnabled state.
- The feature MUST not infer or store sensitive preferences beyond the user’s explicit selections.
- The feature MUST not use hidden behavioral tracking to derive preferences.
- The feature MUST keep preference changes auditable at a product level without exposing unnecessary personal data in logs.
- The feature MUST preserve user control by allowing preference changes and newsletter pauses to be reversed by the user.
- The feature MUST treat onboarding and preference errors as user-facing validation issues, not account-security disclosures.

### Experience & Content Integrity Requirements *(mandatory for user-facing features)*

- The onboarding and preferences experience MUST follow the Daily Paper constitution: modern, bright, minimal, premium in readability, and content-first.
- The experience MUST be mobile-friendly and must stack cleanly on narrow screens.
- The experience MUST be accessible with keyboard navigation, visible focus states, readable labels, and WCAG AA contrast.
- Topic selection MUST use clear chip-style controls with a distinct selected state.
- Progressive disclosure MUST be used so the first step stays simple and advanced region details appear only when needed.
- The empty state MUST clearly explain what preference setup does and what the user gains by completing it.
- Validation messaging MUST be plain-language, direct, and helpful.
- The user experience MUST remain consistent with the shared Design System feature and must not introduce new component behavior without an explicit design exception.

### Observability & Telemetry Requirements *(mandatory)*

- The feature MUST emit privacy-safe product events for onboarding viewed, preference saved, preference updated, newsletter paused, and newsletter resumed.
- The feature MUST emit validation-failure signals for blocked saves, especially when no topic is selected.
- The feature MUST support aggregate visibility into onboarding completion and preference update success without storing sensitive selections in telemetry payloads.
- The feature MUST allow operational teams to detect broken preference saves or dashboard rendering issues without exposing personal data.

### Data Requirements *(mandatory)*

- **preferences**: `userId`, `topics[]`, `region`, `deliveryTime`, `newsletterEnabled`, `updatedAt`
- `userId` MUST identify the authenticated owner of the preference record.
- `topics[]` MUST contain one or more values from the approved taxonomy.
- `region` MUST support a country value and optional province or city detail.
- `deliveryTime` MUST represent the user’s selected daily delivery preference in local time.
- `newsletterEnabled` MUST indicate whether delivery is active or paused.
- `updatedAt` MUST record when the preference record was last changed.

### API Contract *(mandatory)*

- **GET /api/preferences**: Returns the signed-in user’s current preferences, or an empty state when no preferences have been saved yet.
- **PUT /api/preferences**: Saves or updates the signed-in user’s preference record and returns the latest stored preferences.
- Both endpoints MUST require an authenticated session from the Auth dependency.
- Both endpoints MUST validate that at least one topic is selected before accepting a save.

### Key Entities *(include if feature involves data)*

- **Preference Profile**: The saved personalization record for one user, including topics, region, delivery time, newsletter state, and last update time.
- **Topic Selection**: The chosen interests from the approved taxonomy that guide digest content.
- **Region Setting**: The country and optional province or city used to tune local relevance.
- **Delivery Schedule**: The user’s chosen daily delivery time expressed in local time.
- **Newsletter State**: The enabled or paused status that controls whether the digest is delivered.

## Test Plan

- **Unit coverage**: Validate topic-selection requirements, empty-state behavior, region defaults, delivery-time validation, pause/resume state handling, and save/update rules.
- **Integration coverage**: Validate GET /api/preferences and PUT /api/preferences for create, read, and update behavior using an authenticated session.
- **End-to-end coverage**: Validate the signup-to-onboarding flow, saved preference display on dashboard, validation for no topic selected, and pause/resume behavior in a browser.
- **Accessibility review**: Validate keyboard navigation, visible focus states, label clarity, and mobile-friendly responsiveness for the onboarding and preferences UI.
- **Regression coverage**: Validate that preference changes appear in the next newsletter generation path and that previously saved data is not lost during partial updates.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of representative users can complete onboarding and save preferences on their first attempt.
- **SC-002**: 100% of attempted saves without at least one topic selected are rejected with a clear validation message.
- **SC-003**: 100% of successful saves are reflected back to the user on the dashboard after refresh.
- **SC-004**: 100% of verified preference changes are available to the next newsletter generation cycle.
- **SC-005**: At least 95% of representative users can identify how to pause or resume delivery within 30 seconds of opening the preferences screen.
- **SC-006**: 100% of approved mobile layouts keep the onboarding experience readable and actionable without horizontal scrolling.

## Assumptions

- The Auth feature already provides authenticated user identity, session state, and protected access to the dashboard and onboarding flow.
- The Design System feature provides the reusable chip, form, button, empty-state, and validation patterns used here.
- Topic taxonomy values are defined elsewhere and are stable enough for Phase 1 onboarding.
- Province or city entry is optional in Phase 1 and may be left blank without blocking save.
- The pause/resume control is recommended for Phase 1 but remains optional if schedule or scope pressure requires deferral.
- The onboarding flow is part of the broader signup -> onboarding -> first digest journey and is not a standalone public page.

## Implementation Update (2026-06-02)

- Confirmed unit and integration test imports now reference the actual `apps/api` source tree.
- Confirmed preference and onboarding repository updates use monotonic ISO timestamps so rapid updates produce observable `updatedAt` changes.

## Implementation Update (2026-06-02, Web Dashboard Flow)

- Confirmed `/onboarding`, `/settings`, `/dashboard/preferences`, and `/dashboard/newsletter` require a Firebase-authenticated user in the web app.
- Confirmed the local web preference store is keyed by Firebase UID for the current browser implementation.
- Confirmed `/settings` provides the post-login hub for email preferences, newsletter subscription state, and restarting onboarding.

## Implementation Update (2026-06-02, Preference UX Polish)

- Confirmed onboarding starts with no preselected topics and offers grouped topic chips across news, finance, technology/AI, culture, sports, and life.
- Confirmed frequency choices are available in onboarding and editable later from preferences.
- Confirmed account pages remove public Home/Blog links, include back-to-dashboard controls, and add a Netfroot footer link.
