/**
 * Payments / Subscriptions - Phase 2 Placeholder Types
 *
 * These types reserve architecture hooks for future monetization.
 * No business logic or payment processing is permitted in Phase 1.
 * All plan tiers beyond "free" are reserved for Phase 2 activation only.
 */

/** Reserved for Phase 2 - only "free" is active in Phase 1. */
export type PlanTier = "free";

/** Reserved intervals for Phase 2 billing configuration. */
export type BillingInterval = "monthly" | "annual";

/**
 * Reserved premium flags - these MUST remain inactive in Phase 1.
 * Phase 2 activation requires explicit opt-in consent and compliance review.
 */
export type PremiumFeatureFlag = "ad-free" | "more-sources" | "longer-digest";

/**
 * Placeholder for a future subscription plan definition.
 * `enabled` is always false in Phase 1 by design.
 */
export type SubscriptionPlanPlaceholder = {
  id: string;
  tier: PlanTier;
  /** Reserved for Phase 2 billing configuration. */
  billingInterval?: BillingInterval;
  /** Reserved - MUST NOT be set or used in Phase 1. */
  price?: never;
  /** Reserved - MUST NOT be set or used in Phase 1. */
  currency?: never;
  /** Always false in Phase 1. Phase 2 activation requires governance approval. */
  enabled: false;
};

/**
 * Placeholder for future user subscription state.
 * In Phase 1, all users are on the free plan with no cancellation path.
 */
export type UserSubscriptionPlaceholder = {
  userId: string;
  /** Always "free-plan" in Phase 1. */
  planId: "free-plan";
  status: "active";
  startedAt: string;
  /** Cancellation is not permitted in Phase 1. */
  canceledAt?: never;
};

/**
 * Placeholder for future billing events.
 * In Phase 1, only governance check events are produced (no payment events).
 */
export type BillingEventPlaceholder = {
  id: string;
  userId: string;
  /** Reserved for Phase 2 - payment provider transaction reference. */
  providerRef?: never;
  /** Only governance check events are permitted in Phase 1. */
  eventType: "governance_check";
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

/** Result of a Phase 1 scope guard check. */
export type ScopeGuardResult =
  | { allowed: true; tier: "free" }
  | { allowed: false; reason: string };
