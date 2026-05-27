/**
 * US2: My Newsletter Respects My Consent Choice
 * Service implementation
 */

import { telemetryService } from './telemetry';
import type {
  ConsentCheckRequest,
  ConsentCheckResponse,
  ConsentGate,
  ConsentSkipReason,
} from './my-newsletter-respects-my-consent-choice.types';

export class ConsentChoiceService {
  /**
   * Fetch user consent gate settings
   * In production, query from Firestore
   */
  async fetchConsentGate(userId: string): Promise<ConsentGate | null> {
    // Mock implementation - in production, query Firestore
    return null;
  }

  /**
   * Check if user has consented to receive newsletter
   */
  async checkConsent(request: ConsentCheckRequest): Promise<ConsentCheckResponse> {
    try {
      const consentGate = await this.fetchConsentGate(request.userId);

      if (!consentGate) {
        telemetryService.recordSkip('user_not_found', request.date);
        return {
          userId: request.userId,
          consentGranted: false,
          reason: 'user_not_found',
          checkedAt: new Date(),
        };
      }

      // Check newsletter enabled flag
      if (!consentGate.newsletterEnabled) {
        telemetryService.recordSkip('newsletter_disabled', request.date);
        return {
          userId: request.userId,
          consentGranted: false,
          reason: 'newsletter_disabled',
          checkedAt: new Date(),
        };
      }

      // Check if user has preferences
      if (!consentGate.hasPreferences) {
        telemetryService.recordSkip('no_preferences', request.date);
        return {
          userId: request.userId,
          consentGranted: false,
          reason: 'no_preferences',
          checkedAt: new Date(),
        };
      }

      // Check email verification
      if (!consentGate.isVerified) {
        telemetryService.recordSkip('unverified_email', request.date);
        return {
          userId: request.userId,
          consentGranted: false,
          reason: 'unverified_email',
          checkedAt: new Date(),
        };
      }

      // All checks passed
      return {
        userId: request.userId,
        consentGranted: true,
        checkedAt: new Date(),
      };
    } catch (error) {
      telemetryService.recordFailure(
        error instanceof Error ? error.message : 'Unknown error',
        request.date
      );
      throw error;
    }
  }

  /**
   * Update consent for user
   * In production, write to Firestore
   */
  async updateConsent(userId: string, enabled: boolean): Promise<void> {
    // Mock implementation - in production, write to Firestore
    console.log(`Updated consent for user: ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check pre-flight gate before newsletter generation
   */
  async preFlightGate(userId: string, date: Date): Promise<boolean> {
    const consent = await this.checkConsent({ userId, date });
    return consent.consentGranted;
  }
}

export const consentChoiceService = new ConsentChoiceService();
