/**
 * US2: My Newsletter Respects My Consent Choice
 * Types and interfaces
 */

export interface ConsentCheckRequest {
  userId: string;
  date: Date;
}

export interface ConsentCheckResponse {
  userId: string;
  consentGranted: boolean;
  reason?: string;
  checkedAt: Date;
}

export interface ConsentGate {
  userId: string;
  newsletterEnabled: boolean;
  hasPreferences: boolean;
  isVerified: boolean;
  updatedAt: Date;
}

export enum ConsentSkipReason {
  NEWSLETTER_DISABLED = 'newsletter_disabled',
  NO_PREFERENCES = 'no_preferences',
  USER_NOT_FOUND = 'user_not_found',
  UNVERIFIED_EMAIL = 'unverified_email',
}
