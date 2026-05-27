/**
 * US4: Unsubscribe or Update Preferences From Inside the Email
 * Service implementation
 */

import { telemetryService } from './telemetry';
import type {
  EmailManagementLinks,
  UnsubscribeRequest,
  PreferencesUpdateRequest,
} from './unsubscribe-or-update-preferences-from-inside-the-email.types';

export class EmailManagementLinksService {
  /**
   * Generate email management links for newsletter
   */
  generateManagementLinks(userId: string): EmailManagementLinks {
    const unsubscribeToken = this.generateToken(userId, 'unsubscribe');
    const preferencesToken = this.generateToken(userId, 'preferences');

    return {
      unsubscribeUrl: `https://app.dailynews.local/unsubscribe/${userId}?token=${unsubscribeToken}`,
      preferencesUrl: `https://app.dailynews.local/preferences/${userId}?token=${preferencesToken}`,
      unsubscribeToken,
      preferencesToken,
    };
  }

  /**
   * Process unsubscribe request
   */
  async processUnsubscribe(request: UnsubscribeRequest): Promise<void> {
    try {
      // Validate token
      if (!this.validateToken(request.userId, request.token, 'unsubscribe')) {
        throw new Error('Invalid unsubscribe token');
      }

      // Disable newsletter for user
      await this.disableNewsletter(request.userId);

      console.log(`User unsubscribed: ${request.userId}`);
    } catch (error) {
      telemetryService.recordFailure(
        error instanceof Error ? error.message : 'Unknown error',
        new Date()
      );
      throw error;
    }
  }

  /**
   * Process preferences update from email
   */
  async processPreferencesUpdate(request: PreferencesUpdateRequest): Promise<void> {
    try {
      // Validate token
      if (!this.validateToken(request.userId, request.token, 'preferences')) {
        throw new Error('Invalid preferences token');
      }

      // Update preferences
      await this.updatePreferences(request.userId, request.changes);

      console.log(`Preferences updated from email: ${request.userId}`);
    } catch (error) {
      telemetryService.recordFailure(
        error instanceof Error ? error.message : 'Unknown error',
        new Date()
      );
      throw error;
    }
  }

  /**
   * Generate secure token
   */
  private generateToken(userId: string, purpose: string): string {
    // In production, use crypto.randomBytes
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${purpose}_${timestamp}_${random}`;
  }

  /**
   * Validate token
   */
  private validateToken(userId: string, token: string, expectedPurpose: string): boolean {
    // In production, verify against database
    const parts = token.split('_');
    return parts.length === 3 && parts[0] === expectedPurpose;
  }

  /**
   * Disable newsletter for user
   * In production, write to Firestore
   */
  private async disableNewsletter(userId: string): Promise<void> {
    console.log(`Disabled newsletter for user: ${userId}`);
  }

  /**
   * Update preferences
   * In production, write to Firestore
   */
  private async updatePreferences(
    userId: string,
    changes: Record<string, any>
  ): Promise<void> {
    console.log(`Updated preferences for user: ${userId}`, changes);
  }
}

export const emailManagementLinksService = new EmailManagementLinksService();
