# Research - User Dashboard + Newsletter History

## Decision 1: Keep stack aligned to Daily Paper baseline
- Decision: Use Next.js + Node.js + Firestore + Firebase tooling for this feature.
- Rationale: Maintains consistency with constitution default stack and lowers integration friction.
- Alternatives considered: Introducing a parallel backend stack (rejected: higher complexity without clear value).

## Decision 2: Use Firebase Auth as identity baseline
- Decision: Use Firebase Auth for authentication/session identity and Firebase Admin verification for protected APIs and worker-side eligibility checks.
- Rationale: Aligns with product direction, supports claims-based RBAC, and gives consistent UID ownership checks across web, API, and scheduled jobs.
- Alternatives considered: Custom JWT issuer (rejected: unnecessary operational risk), third-party auth provider split (rejected: inconsistent claims and session handling).

## Decision 3: Keep implementation slice-first with strong verification
- Decision: Implement smallest viable vertical slices first and gate each slice with unit/integration/E2E checks.
- Rationale: Matches constitution principle V and reduces regression risk.
- Alternatives considered: Big-bang delivery (rejected: high integration risk and low auditability).
