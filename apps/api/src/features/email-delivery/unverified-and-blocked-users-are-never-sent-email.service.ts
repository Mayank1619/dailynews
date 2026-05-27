/**
 * User Story 4: Unverified and Blocked Users Are Never Sent Email
 * Strict eligibility enforcement
 */

import { EligibilityCheck } from './unverified-and-blocked-users-are-never-sent-email.types';
import { DeliveryEligibilityService } from './delivery-eligibility.service';
import { UserPreferences } from './email-delivery.types';

export class UnverifiedAndBlockedUsersAreNeverSentEmailService {
  private eligibilityService: DeliveryEligibilityService;

  constructor(eligibilityService: DeliveryEligibilityService) {
    this.eligibilityService = eligibilityService;
  }

  /**
   * Perform strict eligibility check
   */
  enforceEligibility(userPreferences: UserPreferences, isBlocked: boolean = false): EligibilityCheck {
    const check: EligibilityCheck = {
      userId: userPreferences.userId,
      isVerified: userPreferences.isVerified,
      isBlocked,
      newsletterEnabled: userPreferences.newsletterEnabled,
      pass: false,
    };

    // Verification check
    if (!userPreferences.isVerified) {
      check.pass = false;
      check.reason = 'email_not_verified';
      return check;
    }

    // Block status check
    if (isBlocked) {
      check.pass = false;
      check.reason = 'account_blocked';
      return check;
    }

    // Newsletter preference check
    if (!userPreferences.newsletterEnabled) {
      check.pass = false;
      check.reason = 'user_unsubscribed';
      return check;
    }

    // All checks passed
    check.pass = true;
    check.reason = 'all_checks_passed';
    return check;
  }

  /**
   * Batch verify users for delivery
   */
  batchVerifyUsers(userPreferences: UserPreferences[], blockedUserIds: Set<string> = new Set()): Map<string, EligibilityCheck> {
    const results = new Map<string, EligibilityCheck>();

    for (const prefs of userPreferences) {
      const isBlocked = blockedUserIds.has(prefs.userId);
      const check = this.enforceEligibility(prefs, isBlocked);
      results.set(prefs.userId, check);
    }

    return results;
  }

  /**
   * Zero-tolerance validation: ensure no invalid users pass
   */
  validateZeroTolerance(checks: Map<string, EligibilityCheck>): { isValid: boolean; failedChecks: EligibilityCheck[] } {
    const failedChecks: EligibilityCheck[] = [];

    for (const check of checks.values()) {
      if (!check.pass) {
        failedChecks.push(check);
      }
    }

    // Zero tolerance: all failed checks must have proper reason
    const isValid = failedChecks.every((check) => check.reason && ['email_not_verified', 'account_blocked', 'user_unsubscribed'].includes(check.reason));

    return { isValid, failedChecks };
  }
}
