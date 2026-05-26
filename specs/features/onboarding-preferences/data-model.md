# Data Model - Onboarding Preferences

## Entities
- PreferenceProfile: userId, topics[], region{country,province?,city?}, deliveryTimeLocal, timezone, newsletterEnabled, updatedAt
- OnboardingState: userId, step, completed, updatedAt
- PreferenceAuditEvent: userId, changedFields[], changedAt, actorType

## Relationships
- PreferenceProfile.userId -> Firebase Auth uid
- OnboardingState.userId -> Firebase Auth uid

## Validation
- At least one topic required.
- API must enforce UID ownership from Firebase Auth token.
