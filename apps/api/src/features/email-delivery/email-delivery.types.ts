/**
 * Email Delivery Common Types
 * Shared data structures for email delivery workflow
 */

export interface EligibilitySnapshot {
  userId: string;
  isVerified: boolean;
  newsletterEnabled: boolean;
  blocked: boolean;
  evaluatedAt: Date;
  reason?: string;
}

export interface EmailLog {
  id: string;
  runId: string;
  userId: string;
  newsletterId: string;
  status: 'sent' | 'failed' | 'skipped';
  attempt: number;
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  reason?: string;
}

export interface DeliveryRun {
  id: string;
  scheduleWindow: string;
  startedAt: Date;
  finishedAt?: Date;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  alertRaised?: boolean;
}

export interface UserPreferences {
  userId: string;
  deliveryTime: string; // HH:mm format
  timezone: string; // IANA timezone
  newsletterEnabled: boolean;
  email: string;
  isVerified: boolean;
}

export interface Newsletter {
  id: string;
  status: 'pending' | 'generated' | 'failed';
  content: string;
  htmlContent?: string;
  subject: string;
  createdAt: Date;
  publishDate: Date;
}

export interface SendAttempt {
  userId: string;
  newsletterId: string;
  email: string;
  attempt: number;
  maxRetries: number;
  backoffMs: number;
}

export interface DeliveryResult {
  success: boolean;
  messageId?: string;
  errorCode?: string;
  errorMessage?: string;
  shouldRetry: boolean;
}

export interface CheckEligibilityResult {
  eligible: boolean;
  reason?: string;
  snapshot: EligibilitySnapshot;
}
