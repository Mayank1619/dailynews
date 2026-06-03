import {
  createPaymentsSubscriptionsTelemetryEvent,
  type PaymentsSubscriptionsTelemetry,
} from "./scope-protection.telemetry";
import type {
  BillingInterval,
  Phase2ActivationCriteria,
  PremiumFeatureFlag,
  ScopeGuardResult,
  SubscriptionPlan,
  UserSubscription,
} from "./scope-protection.types";

export type ScopeProtectionDependencies = {
  telemetry: PaymentsSubscriptionsTelemetry;
  now: () => Date;
};

export const TRIAL_DAYS = 15;

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "daily-paper-plus-monthly",
    tier: "plus",
    name: "Daily Paper Plus",
    billingInterval: "monthly",
    priceCents: 499,
    currency: "USD",
    trialDays: TRIAL_DAYS,
    enabled: true,
  },
  {
    id: "daily-paper-plus-annual",
    tier: "plus",
    name: "Daily Paper Plus Annual",
    billingInterval: "annual",
    priceCents: 4900,
    currency: "USD",
    trialDays: TRIAL_DAYS,
    enabled: true,
  },
];

const ACTIVATION_CRITERIA: Phase2ActivationCriteria = {
  legalComplianceApproved: true,
  paymentProviderSelected: true,
  consentDesignApproved: true,
  migrationPlanDocumented: true,
  constitutionGatesPassed: true,
};

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function daysRemaining(now: Date, trialEndsAt: string): number {
  const remainingMs = new Date(trialEndsAt).getTime() - now.getTime();
  return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
}

export class ScopeProtectionService {
  constructor(private readonly deps: ScopeProtectionDependencies) {}

  getPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  async startTrial(userId: string, planId = "daily-paper-plus-monthly"): Promise<UserSubscription> {
    const now = this.deps.now();
    const subscription: UserSubscription = {
      userId,
      planId: planId as UserSubscription["planId"],
      status: "trialing",
      startedAt: now.toISOString(),
      trialEndsAt: addDays(now, TRIAL_DAYS).toISOString(),
    };

    await this.deps.telemetry.track(
      createPaymentsSubscriptionsTelemetryEvent("subscription.trial_started", "success", {
        userId,
        planId,
        trialDays: TRIAL_DAYS,
      })
    );

    return subscription;
  }

  async getSubscriptionStatus(subscription: UserSubscription): Promise<UserSubscription & { trialDaysRemaining: number }> {
    const now = this.deps.now();
    const status = subscription.status === "trialing" && daysRemaining(now, subscription.trialEndsAt) === 0
      ? "expired"
      : subscription.status;

    await this.deps.telemetry.track(
      createPaymentsSubscriptionsTelemetryEvent("subscription.status_viewed", "success", {
        userId: subscription.userId,
        planId: subscription.planId,
        status,
      })
    );

    return {
      ...subscription,
      status,
      trialDaysRemaining: status === "trialing" ? daysRemaining(now, subscription.trialEndsAt) : 0,
    };
  }

  async createCheckoutIntent(request: {
    userId: string;
    planId: string;
    billingInterval: BillingInterval;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ checkoutUrl: string; providerConfigured: boolean }> {
    const configuredUrl = process.env.STRIPE_PAYMENT_LINK_URL?.trim();

    await this.deps.telemetry.track(
      createPaymentsSubscriptionsTelemetryEvent(
        configuredUrl ? "subscription.checkout_started" : "subscription.provider_not_configured",
        configuredUrl ? "success" : "error",
        {
          userId: request.userId,
          planId: request.planId,
          billingInterval: request.billingInterval,
        }
      )
    );

    if (!configuredUrl) {
      return {
        checkoutUrl: "/billing?checkout=provider-not-configured",
        providerConfigured: false,
      };
    }

    const checkoutUrl = new URL(configuredUrl);
    checkoutUrl.searchParams.set("client_reference_id", request.userId);
    checkoutUrl.searchParams.set("success_url", request.successUrl);
    checkoutUrl.searchParams.set("cancel_url", request.cancelUrl);

    return {
      checkoutUrl: checkoutUrl.toString(),
      providerConfigured: true,
    };
  }

  async checkEntitlement(subscription: UserSubscription, flag: PremiumFeatureFlag): Promise<ScopeGuardResult> {
    const status = await this.getSubscriptionStatus(subscription);
    const allowed = status.status === "trialing" || status.status === "active";

    await this.deps.telemetry.track(
      createPaymentsSubscriptionsTelemetryEvent("subscription.entitlement_checked", allowed ? "success" : "error", {
        userId: subscription.userId,
        flag,
        status: status.status,
      })
    );

    return allowed
      ? { allowed: true, tier: status.status === "trialing" ? "trial" : "plus" }
      : { allowed: false, reason: "Trial expired or subscription inactive." };
  }

  async checkPhase2ActivationCriteria(): Promise<Phase2ActivationCriteria> {
    return ACTIVATION_CRITERIA;
  }
}
