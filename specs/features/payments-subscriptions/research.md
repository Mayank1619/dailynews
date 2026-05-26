# Research - Payments / Subscriptions (Phase 2 Placeholder)

## Decision 1: Keep stack aligned to Daily Paper baseline
- Decision: Use Next.js + Node.js + Firestore + Firebase tooling for this feature.
- Rationale: Maintains consistency with constitution default stack and lowers integration friction.
- Alternatives considered: Introducing a parallel backend stack (rejected: higher complexity without clear value).

## Decision 2: Use Firebase Auth as identity baseline
- Decision: Use Firebase Auth for authentication/session identity and Firebase Admin verification for protected APIs and worker-side eligibility checks.
- Rationale: Aligns with product direction, supports claims-based RBAC, and gives consistent UID ownership checks across web, API, and scheduled jobs.
- Alternatives considered: Custom JWT issuer (rejected: unnecessary operational risk), third-party auth provider split (rejected: inconsistent claims and session handling).

## Decision 3: Keep monetization implementation deferred to Phase 2
- Decision: Produce only placeholder architecture notes and non-executable contracts; do not implement payment flows in Phase 1.
- Rationale: Constitution and feature spec explicitly defer monetization.
- Alternatives considered: Partial checkout prototype in Phase 1 (rejected: violates scope and trust/consent rollout sequencing).
