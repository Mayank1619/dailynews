# Contract - Payments Subscriptions (Placeholder)

## Phase 1 Status

## Reserved Phase 2 Interfaces

## Phase 1 Scope Guard Responses

All reserved endpoints return a scope-blocked response in Phase 1 via `ScopeProtectionService.guardReservedEndpoint()`:

```
{ allowed: false, reason: "This endpoint is reserved for Phase 2 monetization activation and is not available in Phase 1." }
```

Telemetry event emitted per blocked request: `phase1.reserved_endpoint_blocked`

## Free-Tier Subscription Contract (Phase 1)

`GET /api/subscriptions/current-user` placeholder (not yet registered) returns:

```json
{
	"userId": "<firebase-uid>",
	"planId": "free-plan",
	"status": "active",
	"startedAt": "2026-01-01T00:00:00.000Z"
}
```

## Phase 2 Activation Pre-conditions

Before Phase 2 contracts become executable the following must be satisfied:
- `legalComplianceApproved: true`
- `paymentProviderSelected: true`
- `consentDesignApproved: true`
- `migrationPlanDocumented: true`
- `constitutionGatesPassed: true`
