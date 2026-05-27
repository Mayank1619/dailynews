/**
 * User Story 3: My Unsubscribe Request Is Honoured Immediately
 * Types for unsubscribe handling
 */

export interface UnsubscribeRequest {
  userId: string;
  requestedAt: Date;
  source: 'email_link' | 'dashboard' | 'admin' | 'api';
  reason?: string;
}

export interface UnsubscribeResult {
  success: boolean;
  unsubscribed: boolean;
  previousState: boolean;
  timestamp: Date;
  reason?: string;
}

export interface UnsubscribeVerification {
  unsubscribeToken: string;
  userId: string;
  expiresAt: Date;
  isValid: boolean;
}
