/**
 * User Story 2: Delivery Succeeds Even When First Attempt Fails
 * Types for retry tracking
 */

import { EmailLog } from './email-delivery.types';

export interface RetryAttempt {
  userId: string;
  newsletterId: string;
  attemptNumber: number;
  delayMs: number;
  reason?: string;
}

export interface RetryOutcome {
  success: boolean;
  attemptsMade: number;
  finalStatus: 'sent' | 'failed' | 'skipped';
  firstAttemptFailed: boolean;
  lastErrorCode?: string;
  emailLog?: EmailLog;
}
