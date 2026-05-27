/**
 * Payments / Subscriptions - Phase 1 Scope Protection Service
 *
 * This service enforces that no monetization logic can be executed in Phase 1.
 * All reserved Phase 2 endpoints return a scope-blocked response.
 * The service produces governance telemetry only (no payment events).
 */

import {
  createPaymentsSubscriptionsTelemetryEvent,
  type PaymentsSubscriptionsTelemetry,
} from "./scope-protection.telemetry";
import type {
  Phase2ActivationCriteria,
  ScopeGuardResult,
  UserSubscriptionPlaceholder,
} from "./scope-protection.types";

export type ScopeProtectionDependencies = {
  telemetry: PaymentsSubscriptionsTelemetry;
  now: () => Date;
};

/** Free-tier subscription state returned for all users in Phase 1. */
const FREE_TIER_SUBSCRIPTION: Omit<UserSubscriptionPlaceholder, "userId"> = {
  planId: "free-plan",
  status: "active",
  startedAt: "2026-01-01T00:00:00.000Z",
};

/** Phase 2 is not yet activated - all criteria are false in Phase 1. */
const PHASE2_CRITERIA: Phase2ActivationCriteria = {
  legalComplianceApproved: false,
  paymentProviderSelected: false,
  consentDesignApproved: false,
  migrationPlanDocumented: false,
  constitutionGatesPassed: false,
};

export class ScopeProtectionService {
  constructor(private readonly deps: ScopeProtectionDependencies) {}

  /**
   * Returns free-tier subscription state for the given user.
   * No premium entitlement is granted in Phase 1.
   */
  async getFreeTierSubscription(userId: string): Promise<UserSubscriptionPlaceholder> {
    await this.deps.telemetry.track(
      createPaymentsSubscriptionsTelemetryEvent(
        "phase1.free_tier_confirmed",
        "success",
        { userId, phase: "1" }
      )
    );

    return { userId, ...FREE_TIER_SUBSCRIPTION };
  }

  /**
   * Guards Phase 2 reserved endpoints - always returns not-allowed in Phase 1.
   * Emits a governance telemetry event to record the blocked request.
   */
  async guardReservedEndpoint(
    endpoint: string,
    userId?: string
  ): Promise<ScopeGuardResult> {
    await this.deps.telemetry.track(
      createPaymentsSubscriptionsTelemetryEvent(
        "phase1.reserved_endpoint_blocked",
        "error",
        { endpoint, userId: userId ?? "anonymous", phase: "1" }
      )
    );

    return {
      allowed: false,
      reason:
        "This endpoint is reserved for Phase 2 monetization activation and is not available in Phase 1.",
    };
  }

  /**
   * Checks the Phase 2 activation criteria.
   * Returns all-false in Phase 1 as no criteria have been met.
   */
  async checkPhase2ActivationCriteria(): Promise<Phase2ActivationCriteria> {
    await this.deps.telemetry.track(
      createPaymentsSubscriptionsTelemetryEvent(
        "phase1.scope_check_passed",
        "success",
        { phase: "1", allCriteriaFalse: true }
      )
    );

    return PHASE2_CRITERIA;
  }

  /**
   * Validates that a premium feature flag is inactive in Phase 1.
   * Premium flags MUST remain inactive until Phase 2 activation.
   */
  async validatePremiumFlagInactive(
    flag: string,
    userId?: string
  ): Promise<ScopeGuardResult> {
    await this.deps.telemetry.track(
      createPaymentsSubscriptionsTelemetryEvent(
        "phase1.scope_check_passed",
        "success",
        { flag, userId: userId ?? "anonymous", phase: "1", flagActive: false }
      )
    );

    return {
      allowed: false,
      reason: `Premium feature flag "${flag}" is reserved for Phase 2 and is inactive in Phase 1.`,
    };
  }
}
