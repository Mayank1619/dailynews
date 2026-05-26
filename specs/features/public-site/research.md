# Research - Public Site + Landing

## Decision 1: Keep stack aligned to Daily Paper baseline
- Decision: Use Next.js + Node.js + Firestore + Firebase tooling for this feature.
- Rationale: Maintains consistency with constitution default stack and lowers integration friction.
- Alternatives considered: Introducing a parallel backend stack (rejected: higher complexity without clear value).

## Decision 2: Keep identity checks at service boundary only
- Decision: Do not introduce direct auth surfaces in this feature; rely on upstream authenticated artifacts and signed service execution contexts.
- Rationale: This feature primarily transforms or presents data and does not own login/session concerns.
- Alternatives considered: Embedding direct auth checks everywhere (rejected: duplicates upstream controls and adds coupling).

## Decision 3: Keep implementation slice-first with strong verification
- Decision: Implement smallest viable vertical slices first and gate each slice with unit/integration/E2E checks.
- Rationale: Matches constitution principle V and reduces regression risk.
- Alternatives considered: Big-bang delivery (rejected: high integration risk and low auditability).
