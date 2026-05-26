# Data Model - User Dashboard

## Entities
- DashboardPreferenceSummary: userId, topics[], region, deliveryTimeLocal, newsletterEnabled, updatedAt
- NewsletterHistoryItem: newsletterId, userId, date, status, viewUrl?, sentAt?
- DashboardSessionEvent: userId, eventType, timestamp

## Relationships
- DashboardPreferenceSummary.userId -> Firebase Auth uid
- NewsletterHistoryItem.userId -> Firebase Auth uid

## Validation
- UID ownership must be enforced for all history and preference reads.
- Pause/resume writes propagate to PreferenceProfile.
