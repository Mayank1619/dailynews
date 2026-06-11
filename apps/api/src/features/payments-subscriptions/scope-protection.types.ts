/**
 * Payments / Subscriptions Types
 *
 * Phase 2 is activated as a provider-ready subscription model.
 * The app owns trial and entitlement state; payment collection stays with an external provider.
 */

export type PlanTier = "trial" | "plus";

/** Reserved intervals for Phase 2 billing configuration. */
export type BillingInterval = "monthly" | "annual";

export type PremiumFeatureFlag = "ad-free" | "more-sources" | "longer-digest";

export type SubscriptionPlan = {
  id: string;
  tier: PlanTier;
  name: string;
  billingInterval: BillingInterval;
  priceCents: number;
  currency: "USD";
  trialDays: number;
  enabled: true;
};

export type UserSubscription = {
  userId: string;
  planId: "daily-paper-plus-monthly" | "daily-paper-plus-annual";
  status: "trialing" | "active" | "past_due" | "expired" | "canceled";
  startedAt: string;
  trialEndsAt: string;
  currentPeriodEndsAt?: string;
  canceledAt?: string;
};

export type BillingEvent = {
  id: string;
  userId: string;
  providerRef?: string;
  eventType: "trial_started" | "checkout_started" | "subscription_activated" | "subscription_canceled" | "trial_expired";
  occurredAt: string;
};

/** Criteria that must all be true before Phase 2 monetization can be activated. */
export type Phase2ActivationCriteria = {
  legalComplianceApproved: boolean;
  paymentProviderSelected: boolean;
  consentDesignApproved: boolean;
  migrationPlanDocumented: boolean;
  constitutionGatesPassed: boolean;
};

export type ScopeGuardResult =
  | { allowed: true; tier: PlanTier }
  | { allowed: false; reason: string };
