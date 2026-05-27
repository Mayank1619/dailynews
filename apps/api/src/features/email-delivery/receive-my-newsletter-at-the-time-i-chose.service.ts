/**
 * User Story 1: Receive My Newsletter at the Time I Chose
 * Service for timezone-aware scheduled delivery
 */

import { ScheduledDelivery, DeliveryScheduleResult, TimeZoneInfo } from './receive-my-newsletter-at-the-time-i-chose.types';
import { UserPreferences, Newsletter, EmailLog } from './email-delivery.types';
import { DeliveryEligibilityService } from './delivery-eligibility.service';

export class ReceiveMyNewsletterAtTheTimeIChoseService {
  private eligibilityService: DeliveryEligibilityService;

  constructor(eligibilityService: DeliveryEligibilityService) {
    this.eligibilityService = eligibilityService;
  }

  /**
   * Schedule a newsletter for delivery within user's preferred time window
   */
  scheduleDelivery(userPreferences: UserPreferences, newsletter: Newsletter, currentTime: Date = new Date()): DeliveryScheduleResult {
    // Check eligibility first
    const eligibility = this.eligibilityService.checkEligibility(userPreferences);
    if (!eligibility.eligible) {
      return {
        scheduled: false,
        reason: eligibility.reason,
      };
    }

    // Check if newsletter is ready
    if (newsletter.status !== 'generated') {
      return {
        scheduled: false,
        reason: 'newsletter_not_generated',
      };
    }

    try {
      // Calculate delivery window based on user's timezone
      const window = this.calculateDeliveryWindow(userPreferences.timezone, userPreferences.deliveryTime, currentTime);

      const scheduled: ScheduledDelivery = {
        userId: userPreferences.userId,
        newsletterId: newsletter.id,
        userPreferences,
        newsletter,
        scheduledAt: new Date(),
        deliveryWindowStart: window.start,
        deliveryWindowEnd: window.end,
      };

      return {
        scheduled: true,
        deliveryId: `${userPreferences.userId}_${newsletter.id}`,
        windowStart: window.start,
        windowEnd: window.end,
      };
    } catch (error) {
      return {
        scheduled: false,
        reason: `scheduling_error: ${error instanceof Error ? error.message : 'unknown'}`,
      };
    }
  }

  /**
   * Check if current time is within user's delivery window
   */
  isWithinDeliveryWindow(userPreferences: UserPreferences, currentTime: Date = new Date()): boolean {
    return this.eligibilityService.isInDeliveryWindow(userPreferences.deliveryTime, userPreferences.timezone, currentTime);
  }

  /**
   * Calculate delivery window for a user
   */
  calculateDeliveryWindow(timezone: string, deliveryTime: string, baseDate: Date = new Date()): { start: Date; end: Date } {
    try {
      const [hours, minutes] = deliveryTime.split(':').map(Number);

      // Create start of delivery window in user's timezone
      const userDate = this.getDateInTimezone(timezone, baseDate);

      // Set to delivery time
      userDate.setHours(hours, minutes, 0, 0);

      // Convert back to UTC
      const start = new Date(userDate.toLocaleString('en-US', { timeZone: 'UTC' }));

      // End window is 1 hour later
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      return { start, end };
    } catch (error) {
      console.error('Error calculating delivery window:', error);
      // Fallback: use current time as window
      return {
        start: new Date(baseDate),
        end: new Date(baseDate.getTime() + 60 * 60 * 1000),
      };
    }
  }

  /**
   * Get timezone info for a user
   */
  getTimeZoneInfo(timezone: string): TimeZoneInfo {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'longOffset',
    });

    const formatted = formatter.format(new Date());
    const match = formatted.match(/GMT([+-]\d{1,2}:\d{2})/);
    const offset = match ? this.parseGMTOffset(match[1]) : 0;

    return {
      timezone,
      offset,
      isDST: this.isDaylightSavingTime(timezone),
    };
  }

  /**
   * Get current date in specific timezone
   */
  private getDateInTimezone(timezone: string, date: Date): Date {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const values: Record<string, number> = {};

    parts.forEach((part) => {
      if (part.type !== 'literal') {
        values[part.type] = parseInt(part.value);
      }
    });

    return new Date(values.year, values.month - 1, values.day, values.hour, values.minute, values.second);
  }

  /**
   * Parse GMT offset string (e.g., "GMT-5:00")
   */
  private parseGMTOffset(offset: string): number {
    const match = offset.match(/GMT([+-])(\d{1,2}):(\d{2})/);
    if (!match) return 0;

    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2]);
    const minutes = parseInt(match[3]);

    return sign * (hours * 60 + minutes);
  }

  /**
   * Check if timezone is currently in daylight saving time
   */
  private isDaylightSavingTime(timezone: string): boolean {
    const january = new Date(2024, 0, 1);
    const july = new Date(2024, 6, 1);

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });

    const janName = formatter.format(january);
    const julName = formatter.format(july);

    return janName !== julName;
  }
}
