/**
 * User Story 3: My Unsubscribe Request Is Honoured Immediately
 * Service handling unsubscribe logic
 */

import { UnsubscribeRequest, UnsubscribeResult } from './my-unsubscribe-request-is-honoured-immediately.types';
import { UserPreferences, EmailLog } from './email-delivery.types';

export class MyUnsubscribeRequestIsHonouredImmediatelyService {
  /**
   * Process unsubscribe request
   */
  processUnsubscribe(request: UnsubscribeRequest, currentPreferences: UserPreferences): UnsubscribeResult {
    const previousState = currentPreferences.newsletterEnabled;

    // Update preferences to unsubscribed
    const updated: UserPreferences = {
      ...currentPreferences,
      newsletterEnabled: false,
    };

    return {
      success: true,
      unsubscribed: true,
      previousState,
      timestamp: new Date(),
      reason: `Unsubscribed via ${request.source}`,
    };
  }

  /**
   * Process re-subscribe request
   */
  processResubscribe(userId: string, currentPreferences: UserPreferences): UnsubscribeResult {
    const previousState = currentPreferences.newsletterEnabled;

    const updated: UserPreferences = {
      ...currentPreferences,
      newsletterEnabled: true,
    };

    return {
      success: true,
      unsubscribed: false,
      previousState,
      timestamp: new Date(),
      reason: `Re-subscribed via dashboard`,
    };
  }

  /**
   * Verify user has unsubscribed before delivery
   */
  verifyUnsubscribeStatus(emailLogs: EmailLog[], userId: string): { unsubscribed: boolean; reason?: string } {
    // Check if latest log for this user shows skip due to unsubscribe
    const sortedLogs = emailLogs.filter((log) => log.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (sortedLogs.length > 0) {
      const latest = sortedLogs[0];
      if (latest.status === 'skipped' && latest.reason === 'user_unsubscribed') {
        return { unsubscribed: true, reason: 'user_unsubscribed' };
      }
    }

    return { unsubscribed: false };
  }

  /**
   * Generate unsubscribe link
   */
  generateUnsubscribeLink(userId: string, baseUrl: string): string {
    const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64');
    return `${baseUrl}/api/email/unsubscribe?token=${token}`;
  }

  /**
   * Validate unsubscribe token
   */
  validateUnsubscribeToken(token: string, userId: string): boolean {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [decodedUserId] = decoded.split(':');
      return decodedUserId === userId;
    } catch {
      return false;
    }
  }
}
