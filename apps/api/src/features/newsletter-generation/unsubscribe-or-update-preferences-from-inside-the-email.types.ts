/**
 * US4: Unsubscribe or Update Preferences From Inside the Email
 * Types and interfaces
 */

export interface UnsubscribeLink {
  url: string;
  token: string;
  userId: string;
  expiresAt: Date;
}

export interface PreferencesLink {
  url: string;
  token: string;
  userId: string;
  expiresAt: Date;
}

export interface EmailManagementLinks {
  unsubscribeUrl: string;
  preferencesUrl: string;
  unsubscribeToken: string;
  preferencesToken: string;
}

export interface UnsubscribeRequest {
  userId: string;
  token: string;
  confirmedAt: Date;
}

export interface PreferencesUpdateRequest {
  userId: string;
  token: string;
  changes: {
    topics?: string[];
    region?: string;
    deliveryTime?: string;
  };
}
