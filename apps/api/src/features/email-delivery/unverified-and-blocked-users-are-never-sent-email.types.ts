/**
 * User Story 4: Unverified and Blocked Users Are Never Sent Email
 * Types for eligibility enforcement
 */

export interface EligibilityCheck {
  userId: string;
  isVerified: boolean;
  isBlocked: boolean;
  newsletterEnabled: boolean;
  pass: boolean;
  reason?: string;
}

export interface EligibilityEnforcementLog {
  userId: string;
  checkType: 'verification' | 'block_status' | 'newsletter_preference';
  passed: boolean;
  timestamp: Date;
}
