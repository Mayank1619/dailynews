/**
 * User Story 1: Receive My Newsletter at the Time I Chose
 * Types for timezone-aware delivery
 */

import { EmailLog, UserPreferences, Newsletter } from './email-delivery.types';

export interface ScheduledDelivery {
  userId: string;
  newsletterId: string;
  userPreferences: UserPreferences;
  newsletter: Newsletter;
  scheduledAt: Date;
  deliveryWindowStart: Date;
  deliveryWindowEnd: Date;
}

export interface TimeZoneInfo {
  timezone: string;
  offset: number;
  isDST: boolean;
}

export interface DeliveryScheduleResult {
  scheduled: boolean;
  deliveryId?: string;
  windowStart?: Date;
  windowEnd?: Date;
  reason?: string;
  emailLog?: EmailLog;
}
