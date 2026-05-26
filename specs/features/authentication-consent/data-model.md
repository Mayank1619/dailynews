# Data Model - Authentication + Consent

## Entities
- AuthProfile: uid, email, isVerified, createdAt, lastLoginAt, blocked
- ConsentRecord: uid, newsletterConsent, productUpdatesConsent, offersConsent, termsVersion, privacyVersion, consentedAt, revokedAt?
- SessionAudit: uid, eventType(login/logout/reset), eventTimestamp, ipHash, userAgentHash

## Relationships
- ConsentRecord.uid -> AuthProfile.uid
- SessionAudit.uid -> AuthProfile.uid

## Validation
- UID source of truth is Firebase Auth.
- Consent records are versioned and append-only for auditability.
