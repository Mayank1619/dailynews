import { describe, expect, it, vi } from "vitest";
import { ScopeProtectionService } from "../../../apps/api/src/features/payments-subscriptions/scope-protection.service";
import type { ScopeProtectionDependencies } from "../../../apps/api/src/features/payments-subscriptions/scope-protection.service";

/**
 * Integration contract tests for Payments / Subscriptions Phase 1 placeholder.
 *
 * These tests verify that:
 * 1. Reserved Phase 2 API contracts are blocked and return Phase 1 scope-guard responses.
 * 2. No payment processing, billing, or entitlement logic is reachable in Phase 1.
 * 3. Free-tier subscription state is the only state returned to all users.
 */

function createDeps(): ScopeProtectionDependencies {
  return {
    telemetry: { track: vi.fn() },
    now: () => new Date("2026-05-26T12:00:00.000Z"),
  };
}

// ---------------------------------------------------------------------------
// US1 integration: reserved contract endpoints are blocked
// ---------------------------------------------------------------------------
describe("US1 integration: reserved API contracts are not executable in Phase 1", () => {
  const reservedEndpoints = [
    "/api/subscriptions/checkout",
    "/api/subscriptions/webhook",
    "/api/subscriptions/status",
  ];

  for (const endpoint of reservedEndpoints) {
    it(`blocks reserved endpoint ${endpoint}`, async () => {
      const service = new ScopeProtectionService(createDeps());
      const result = await service.guardReservedEndpoint(endpoint, "test-uid");

      expect(result.allowed).toBe(false);
      const blocked = result as { allowed: false; reason: string };
      expect(typeof blocked.reason).toBe("string");
      expect(blocked.reason.length).toBeGreaterThan(0);
    });
  }

  it("records a governance telemetry event for each blocked endpoint", async () => {
    const deps = createDeps();
    const service = new ScopeProtectionService(deps);

    await service.guardReservedEndpoint("/api/subscriptions/checkout", "uid-99");

    const trackMock = vi.mocked(deps.telemetry.track);
    expect(trackMock).toHaveBeenCalledOnce();

    const [event] = trackMock.mock.calls[0]!;
    expect(event.feature).toBe("payments-subscriptions");
    expect(event.eventName).toBe("phase1.reserved_endpoint_blocked");
    expect(event.metadata["endpoint"]).toBe("/api/subscriptions/checkout");
    expect(event.metadata["userId"]).toBe("uid-99");
  });
});

// ---------------------------------------------------------------------------
// US2 integration: Phase 2 activation hooks are documented but inactive
// ---------------------------------------------------------------------------
describe("US2 integration: Phase 2 activation hooks present but all inactive", () => {
  it("returns a complete criteria shape with all booleans false", async () => {
    const service = new ScopeProtectionService(createDeps());
    const criteria = await service.checkPhase2ActivationCriteria();

    // All named Phase 2 hooks exist in the criteria object
    const expectedFields: (keyof typeof criteria)[] = [
      "legalComplianceApproved",
      "paymentProviderSelected",
      "consentDesignApproved",
      "migrationPlanDocumented",
      "constitutionGatesPassed",
    ];

    for (const field of expectedFields) {
      expect(field in criteria).toBe(true);
      expect(criteria[field]).toBe(false);
    }
  });

  it("flags ad-free, more-sources, longer-digest as inactive hooks", async () => {
    const service = new ScopeProtectionService(createDeps());
    const premiumFlags = ["ad-free", "more-sources", "longer-digest"];

    for (const flag of premiumFlags) {
      const result = await service.validatePremiumFlagInactive(flag, "uid-x");
      expect(result.allowed).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// US3 integration: free-tier subscription state contract
// ---------------------------------------------------------------------------
describe("US3 integration: free-tier subscription state satisfies contract shape", () => {
  it("free-tier subscription satisfies UserSubscriptionPlaceholder shape", async () => {
    const service = new ScopeProtectionService(createDeps());
    const sub = await service.getFreeTierSubscription("contract-uid-1");

    // Contract fields
    expect(typeof sub.userId).toBe("string");
    expect(sub.planId).toBe("free-plan");
    expect(sub.status).toBe("active");
    expect(typeof sub.startedAt).toBe("string");
    expect(sub.canceledAt).toBeUndefined();
  });

  it("free-tier subscription contains no payment-sensitive contract fields", async () => {
    const service = new ScopeProtectionService(createDeps());
    const sub = await service.getFreeTierSubscription("contract-uid-2");

    const serialized = JSON.stringify(sub);
    // No payment provider references or billing amounts
    expect(serialized).not.toContain("stripe");
    expect(serialized).not.toContain("price");
    expect(serialized).not.toContain("amount");
    expect(serialized).not.toContain("invoice");
    expect(serialized).not.toContain("card");
  });

  it("each user gets consistent free-tier state (idempotent read)", async () => {
    const service = new ScopeProtectionService(createDeps());

    const sub1 = await service.getFreeTierSubscription("user-A");
    const sub2 = await service.getFreeTierSubscription("user-A");

    expect(sub1.planId).toBe(sub2.planId);
    expect(sub1.status).toBe(sub2.status);
  });
});
