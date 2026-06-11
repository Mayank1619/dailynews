import { describe, expect, it, vi } from "vitest";
import {
  ScopeProtectionService,
  type ScopeProtectionDependencies
} from "../../../apps/api/src/features/payments-subscriptions/scope-protection.service";

function createDeps(): ScopeProtectionDependencies {
  return {
    telemetry: { track: vi.fn() },
    now: () => new Date("2026-06-02T12:00:00.000Z"),
  };
}

describe("payments subscriptions integration contracts", () => {
  it("returns active Phase 2 activation criteria", async () => {
    const service = new ScopeProtectionService(createDeps());
    const criteria = await service.checkPhase2ActivationCriteria();

    expect(criteria).toEqual({
      legalComplianceApproved: true,
      paymentProviderSelected: true,
      consentDesignApproved: true,
      migrationPlanDocumented: true,
      constitutionGatesPassed: true,
    });
  });

  it("current-user contract includes trial fields", async () => {
    const service = new ScopeProtectionService(createDeps());
    const subscription = await service.startTrial("contract-uid-1");
    const status = await service.getSubscriptionStatus(subscription);

    expect(status).toEqual(
      expect.objectContaining({
        userId: "contract-uid-1",
        planId: "daily-paper-plus-monthly",
        status: "trialing",
        startedAt: "2026-06-02T12:00:00.000Z",
        trialEndsAt: "2026-06-17T12:00:00.000Z",
        trialDaysRemaining: 15,
      })
    );
  });

  it("checkout contract returns provider readiness state", async () => {
    const service = new ScopeProtectionService(createDeps());
    const checkout = await service.createCheckoutIntent({
      userId: "contract-uid-2",
      planId: "daily-paper-plus-annual",
      billingInterval: "annual",
      successUrl: "https://dailynews-theta-ten.vercel.app/billing?success=true",
      cancelUrl: "https://dailynews-theta-ten.vercel.app/billing?canceled=true",
    });

    expect(checkout).toEqual({
      checkoutUrl: "/billing?checkout=provider-not-configured",
      providerConfigured: false,
    });
  });

  it("subscription contract contains no card-sensitive fields", async () => {
    const service = new ScopeProtectionService(createDeps());
    const status = await service.getSubscriptionStatus(await service.startTrial("contract-uid-3"));
    const serialized = JSON.stringify(status);

    expect(serialized).not.toContain("card");
    expect(serialized).not.toContain("cvv");
    expect(serialized).not.toContain("payment_method");
  });
});
