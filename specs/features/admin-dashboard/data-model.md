# Data Model - Admin Dashboard

## Entities
- AdminActionLog: actorUid, actorRole, actionType, targetType, targetId, outcome, reason, timestamp
- AdminUserView: userId, emailMasked, accountStatus, createdAt, consentSnapshot, preferenceSnapshot
- SourceConfig: id, name, type, url, enabled, categoryHint, createdAt

## Relationships
- AdminActionLog.actorUid -> Auth user UID
- AdminUserView.userId -> Auth user UID

## Validation
- Admin route actions require admin claim on Firebase Auth token.
- Every privileged mutation writes exactly one AdminActionLog record.
