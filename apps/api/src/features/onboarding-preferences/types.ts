/**
 * Onboarding Preferences - Shared Types
 * Core domain models for preference management
 */

export type Region = {
  country: "Canada" | string;
  province?: string;
  city?: string;
};

export type PreferenceProfile = {
  userId: string;
  topics: string[]; // At least 1 required
  region: Region;
  deliveryTimeLocal: string; // HH:MM format in user's local time
  timezone: string; // e.g., "America/Toronto"
  newsletterEnabled: boolean;
  updatedAt: string; // ISO timestamp
};

export type OnboardingState = {
  userId: string;
  step: number; // 1: topics, 2: region, 3: delivery-time
  completed: boolean;
  updatedAt: string;
};

export type PreferenceAuditEvent = {
  userId: string;
  changedFields: (keyof PreferenceProfile)[];
  changedAt: string;
  actorType: "user" | "system";
  previousValues?: Record<string, unknown>;
};

export type GetPreferencesRequest = {
  userId: string;
};

export type GetPreferencesResponse = {
  profile: PreferenceProfile | null;
  state: OnboardingState | null;
};

export type SavePreferencesRequest = {
  userId: string;
  topics: string[];
  region: Region;
  deliveryTimeLocal: string;
  timezone: string;
  newsletterEnabled?: boolean;
};

export type SavePreferencesResponse = {
  profile: PreferenceProfile;
};

export type UpdatePreferencesRequest = {
  userId: string;
  topics?: string[];
  region?: Region;
  deliveryTimeLocal?: string;
  timezone?: string;
  newsletterEnabled?: boolean;
};

export type UpdatePreferencesResponse = {
  profile: PreferenceProfile;
};

export type ToggleNewsletterRequest = {
  userId: string;
  enabled: boolean;
};

export type ToggleNewsletterResponse = {
  profile: PreferenceProfile;
};

// Validation result types
export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

export type ValidationError = {
  field: string;
  message: string;
};

// Topic validation
export type TopicTaxonomy = {
  topics: string[];
  lastUpdated: string;
};
