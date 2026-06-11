import { describe, expect, it, vi } from "vitest";
import {
  ScopeProtectionService,
  SUBSCRIPTION_PLANS,
  TRIAL_DAYS,
  type ScopeProtectionDependencies
} from "../../../apps/api/src/features/payments-subscriptions/scope-protection.service";
import { createPaymentsSubscriptionsTelemetryEvent } from "../../../apps/api/src/features/payments-subscriptions/scope-protection.telemetry";

function createDependencies(): ScopeProtectionDependencies {
  return {
    telemetry: {
      track: vi.fn(),
    },
    now: () => new Date("2026-06-02T10:00:00.000Z"),
  };
}

describe("payments subscriptions: plans and trial lifecycle", () => {
  it("defines monthly and annual Daily Paper Plus plans with a 15-day trial", () => {
    expect(SUBSCRIPTION_PLANS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "daily-paper-plus-monthly", priceCents: 499, trialDays: TRIAL_DAYS }),
        expect.objectContaining({ id: "daily-paper-plus-annual", priceCents: 4900, trialDays: TRIAL_DAYS }),
      ])
    );
  });

  it("starts a 15-day trial for a new user", async () => {
    const service = new ScopeProtectionService(createDependencies());
    const subscription = await service.startTrial("user-001");

    expect(subscription.userId).toBe("user-001");
    expect(subscription.status).toBe("trialing");
    expect(subscription.trialEndsAt).toBe("2026-06-17T10:00:00.000Z");
  });

  it("reports remaining trial days while trialing", async () => {
    const service = new ScopeProtectionService(createDependencies());
    const subscription = await service.startTrial("user-002");
    const status = await service.getSubscriptionStatus(subscription);

    expect(status.status).toBe("trialing");
    expect(status.trialDaysRemaining).toBe(15);
  });

  it("marks trial as expired after the trial end date", async () => {
    const service = new ScopeProtectionService({
      ...createDependencies(),
      now: () => new Date("2026-06-18T10:00:00.000Z"),
    });

    const status = await service.getSubscriptionStatus({
      userId: "user-003",
      planId: "daily-paper-plus-monthly",
      status: "trialing",
      startedAt: "2026-06-02T10:00:00.000Z",
      trialEndsAt: "2026-06-17T10:00:00.000Z",
    });

    expect(status.status).toBe("expired");
    expect(status.trialDaysRemaining).toBe(0);
  });

  it("allows trialing and active users through entitlement checks", async () => {
    const service = new ScopeProtectionService(createDependencies());
    const trial = await service.startTrial("user-004");

    await expect(service.checkEntitlement(trial, "more-sources")).resolves.toEqual({ allowed: true, tier: "trial" });
    await expect(service.checkEntitlement({ ...trial, status: "active" }, "longer-digest")).resolves.toEqual({ allowed: true, tier: "plus" });
  });

  it("blocks expired users from paid newsletter entitlements", async () => {
    const service = new ScopeProtectionService(createDependencies());
    const result = await service.checkEntitlement({
      userId: "user-005",
      planId: "daily-paper-plus-monthly",
      status: "expired",
      startedAt: "2026-06-02T10:00:00.000Z",
      trialEndsAt: "2026-06-17T10:00:00.000Z",
    }, "more-sources");

    expect(result.allowed).toBe(false);
  });

  it("returns provider-not-configured checkout without exposing payment data", async () => {
    const service = new ScopeProtectionService(createDependencies());
    const result = await service.createCheckoutIntent({
      userId: "user-006",
      planId: "daily-paper-plus-monthly",
      billingInterval: "monthly",
      successUrl: "https://dailynews-theta-ten.vercel.app/billing?success=true",
      cancelUrl: "https://dailynews-theta-ten.vercel.app/billing?canceled=true",
    });

    expect(result.providerConfigured).toBe(false);
    expect(result.checkoutUrl).toContain("provider-not-configured");
  });
});

describe("payments telemetry factory", () => {
  it("creates lifecycle telemetry without non-primitive metadata", () => {
    const event = createPaymentsSubscriptionsTelemetryEvent("subscription.trial_started", "success", {
      userId: "u1",
      trialDays: 15,
      nested: { card: "never" },
    });

    expect(event.feature).toBe("payments-subscriptions");
    expect(event.metadata["userId"]).toBe("u1");
    expect(event.metadata["trialDays"]).toBe(15);
    expect(event.metadata["nested"]).toBeUndefined();
  });
});
