import { describe, expect, it, vi } from "vitest";
import { ScopeProtectionService } from "../../../apps/api/src/features/payments-subscriptions/scope-protection.service";
import { createPaymentsSubscriptionsTelemetryEvent } from "../../../apps/api/src/features/payments-subscriptions/scope-protection.telemetry";
import type { ScopeProtectionDependencies } from "../../../apps/api/src/features/payments-subscriptions/scope-protection.service";

function createDependencies(): ScopeProtectionDependencies {
  return {
    telemetry: {
      track: vi.fn(),
    },
    now: () => new Date("2026-05-26T10:00:00.000Z"),
  };
}

// ---------------------------------------------------------------------------
// US1: Protect Phase 1 Scope From Accidental Monetization Work
// ---------------------------------------------------------------------------
describe("US1 unit: scope protection - Phase 1 guard prevents monetization", () => {
  it("blocks reserved checkout endpoint and emits governance telemetry", async () => {
    const deps = createDependencies();
    const service = new ScopeProtectionService(deps);

    const result = await service.guardReservedEndpoint(
      "/api/subscriptions/checkout",
      "user-123"
    );

    expect(result.allowed).toBe(false);
    expect((result as { allowed: false; reason: string }).reason).toContain("Phase 2");
    expect(deps.telemetry.track).toHaveBeenCalledOnce();

    const [event] = vi.mocked(deps.telemetry.track).mock.calls[0]!;
    expect(event.feature).toBe("payments-subscriptions");
    expect(event.eventName).toBe("phase1.reserved_endpoint_blocked");
    expect(event.status).toBe("error");
    expect(event.metadata["endpoint"]).toBe("/api/subscriptions/checkout");
  });

  it("blocks reserved webhook endpoint", async () => {
    const deps = createDependencies();
    const service = new ScopeProtectionService(deps);

    const result = await service.guardReservedEndpoint(
      "/api/subscriptions/webhook"
    );

    expect(result.allowed).toBe(false);
  });

  it("blocks reserved subscription-status endpoint", async () => {
    const deps = createDependencies();
    const service = new ScopeProtectionService(deps);

    const result = await service.guardReservedEndpoint(
      "/api/subscriptions/status",
      "user-456"
    );

    expect(result.allowed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// US2: Preserve Future Activation Hooks for Phase 2
// ---------------------------------------------------------------------------
describe("US2 unit: scope protection - Phase 2 activation criteria are all false in Phase 1", () => {
  it("returns all activation criteria as false before Phase 2 approval", async () => {
    const deps = createDependencies();
    const service = new ScopeProtectionService(deps);

    const criteria = await service.checkPhase2ActivationCriteria();

    expect(criteria.legalComplianceApproved).toBe(false);
    expect(criteria.paymentProviderSelected).toBe(false);
    expect(criteria.consentDesignApproved).toBe(false);
    expect(criteria.migrationPlanDocumented).toBe(false);
    expect(criteria.constitutionGatesPassed).toBe(false);
  });

  it("emits governance scope-check telemetry when activation criteria are read", async () => {
    const deps = createDependencies();
    const service = new ScopeProtectionService(deps);

    await service.checkPhase2ActivationCriteria();

    expect(deps.telemetry.track).toHaveBeenCalledOnce();
    const [event] = vi.mocked(deps.telemetry.track).mock.calls[0]!;
    expect(event.eventName).toBe("phase1.scope_check_passed");
    expect(event.metadata["allCriteriaFalse"]).toBe(true);
  });

  it("marks premium flags as inactive in Phase 1", async () => {
    const deps = createDependencies();
    const service = new ScopeProtectionService(deps);

    for (const flag of ["ad-free", "more-sources", "longer-digest"] as const) {
      const result = await service.validatePremiumFlagInactive(flag, "user-789");
      expect(result.allowed).toBe(false);
      expect((result as { allowed: false; reason: string }).reason).toContain(flag);
    }
  });
});

// ---------------------------------------------------------------------------
// US3: Keep User Trust and Consent Expectations Intact
// ---------------------------------------------------------------------------
describe("US3 unit: scope protection - free tier subscription state", () => {
  it("returns free-plan subscription for any user in Phase 1", async () => {
    const deps = createDependencies();
    const service = new ScopeProtectionService(deps);

    const subscription = await service.getFreeTierSubscription("user-001");

    expect(subscription.userId).toBe("user-001");
    expect(subscription.planId).toBe("free-plan");
    expect(subscription.status).toBe("active");
    expect(subscription.canceledAt).toBeUndefined();
  });

  it("emits free-tier confirmation telemetry without payment data", async () => {
    const deps = createDependencies();
    const service = new ScopeProtectionService(deps);

    await service.getFreeTierSubscription("user-002");

    expect(deps.telemetry.track).toHaveBeenCalledOnce();
    const [event] = vi.mocked(deps.telemetry.track).mock.calls[0]!;
    expect(event.eventName).toBe("phase1.free_tier_confirmed");
    expect(event.feature).toBe("payments-subscriptions");
    // No payment-related metadata
    const metadataKeys = Object.keys(event.metadata);
    for (const key of metadataKeys) {
      expect(key).not.toMatch(/stripe|card|billing_amount|invoice|charge/i);
    }
  });

  it("confirms free tier does not include premium entitlements", async () => {
    const deps = createDependencies();
    const service = new ScopeProtectionService(deps);

    const subscription = await service.getFreeTierSubscription("user-003");

    // planId must be free-plan, never a premium tier
    expect(subscription.planId).toBe("free-plan");
    // No premium flag metadata in the response
    expect(JSON.stringify(subscription)).not.toContain("ad-free");
    expect(JSON.stringify(subscription)).not.toContain("more-sources");
    expect(JSON.stringify(subscription)).not.toContain("longer-digest");
  });
});

// ---------------------------------------------------------------------------
// Telemetry factory unit tests
// ---------------------------------------------------------------------------
describe("telemetry factory: createPaymentsSubscriptionsTelemetryEvent", () => {
  it("creates a valid Phase 1 governance event", () => {
    const event = createPaymentsSubscriptionsTelemetryEvent(
      "phase1.scope_check_passed",
      "success",
      { userId: "u1", phase: "1" }
    );

    expect(event.feature).toBe("payments-subscriptions");
    expect(event.eventName).toBe("phase1.scope_check_passed");
    expect(event.status).toBe("success");
    expect(event.metadata["userId"]).toBe("u1");
    expect(typeof event.occurredAt).toBe("string");
  });

  it("strips non-primitive metadata values", () => {
    const event = createPaymentsSubscriptionsTelemetryEvent(
      "phase1.free_tier_confirmed",
      "success",
      {
        userId: "u2",
        // These should be stripped (not string/number/boolean)
        nestedObject: { foo: "bar" },
        arrayValue: [1, 2, 3],
      }
    );

    expect(event.metadata["userId"]).toBe("u2");
    expect(event.metadata["nestedObject"]).toBeUndefined();
    expect(event.metadata["arrayValue"]).toBeUndefined();
  });
});
