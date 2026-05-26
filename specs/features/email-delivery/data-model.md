# Data Model - Email Delivery

## Entities
- EmailLog: id, runId, userId, newsletterId, status, attempt, providerMessageId?, errorCode?, createdAt
- DeliveryRun: id, scheduleWindow, startedAt, finishedAt, sentCount, failedCount, skippedCount, alertRaised
- EligibilitySnapshot: userId, isVerified, newsletterEnabled, blocked, evaluatedAt, reason

## Relationships
- EmailLog.userId -> Firebase Auth uid
- EmailLog.newsletterId -> Newsletter.id
- EligibilitySnapshot.userId -> Firebase Auth uid

## Validation
- Eligibility check must pass before enqueue/send.
- Idempotency key: userId + newsletterId.
