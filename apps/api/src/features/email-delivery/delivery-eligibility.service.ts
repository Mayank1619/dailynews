/**
 * Delivery Eligibility Service
 * Enforces pre-flight eligibility checks: verified + active + newsletterEnabled
 * This is a constitutional invariant (Principle IV)
 */

import { CheckEligibilityResult, EligibilitySnapshot, UserPreferences } from './email-delivery.types';

export class DeliveryEligibilityService {
  /**
   * Check if a user is eligible to receive a newsletter
   * Pre-flight gate: user must be verified, not blocked, and have newsletter enabled
   */
  checkEligibility(preferences: UserPreferences, userBlocked: boolean = false): CheckEligibilityResult {
    const snapshot: EligibilitySnapshot = {
      userId: preferences.userId,
      isVerified: preferences.isVerified,
      newsletterEnabled: preferences.newsletterEnabled,
      blocked: userBlocked,
      evaluatedAt: new Date(),
    };

    // Check verification status first
    if (!preferences.isVerified) {
      return {
        eligible: false,
        reason: 'email_not_verified',
        snapshot: {
          ...snapshot,
          reason: 'User email address not verified',
        },
      };
    }

    // Check account status
    if (userBlocked) {
      return {
        eligible: false,
        reason: 'account_blocked',
        snapshot: {
          ...snapshot,
          reason: 'User account has been blocked',
        },
      };
    }

    // Check newsletter subscription status
    if (!preferences.newsletterEnabled) {
      return {
        eligible: false,
        reason: 'user_unsubscribed',
        snapshot: {
          ...snapshot,
          reason: 'User has unsubscribed from newsletters',
        },
      };
    }

    // All checks passed
    return {
      eligible: true,
      snapshot: {
        ...snapshot,
        reason: 'All eligibility checks passed',
      },
    };
  }

  /**
   * Check if multiple users are eligible in batch
   */
  checkEligibilityBatch(userPreferences: UserPreferences[], blockedUserIds: Set<string> = new Set()): Map<string, CheckEligibilityResult> {
    const results = new Map<string, CheckEligibilityResult>();

    for (const prefs of userPreferences) {
      const isBlocked = blockedUserIds.has(prefs.userId);
      results.set(prefs.userId, this.checkEligibility(prefs, isBlocked));
    }

    return results;
  }

  /**
   * Get delivery window status for a user
   * Returns true if current time is within user's delivery window
   */
  isInDeliveryWindow(deliveryTime: string, userTimezone: string, currentTime: Date = new Date()): boolean {
    try {
      // Parse delivery time HH:mm
      const [hours, minutes] = deliveryTime.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        return false;
      }

      // Get time in user's timezone
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: userTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).formatToParts(currentTime);

      let hour = 0,
        minute = 0;

      for (const part of parts) {
        if (part.type === 'hour') hour = parseInt(part.value);
        if (part.type === 'minute') minute = parseInt(part.value);
      }

      // Allow 1-hour delivery window (deliveryTime to deliveryTime + 1 hour)
      const userMinutes = hour * 60 + minute;
      const deliveryMinutes = hours * 60 + minutes;
      const windowEnd = (deliveryMinutes + 60) % (24 * 60); // 1-hour window

      if (deliveryMinutes <= windowEnd) {
        return userMinutes >= deliveryMinutes && userMinutes < windowEnd;
      } else {
        // Window wraps around midnight
        return userMinutes >= deliveryMinutes || userMinutes < windowEnd;
      }
    } catch (error) {
      console.error('Error checking delivery window:', error);
      return false;
    }
  }
}
