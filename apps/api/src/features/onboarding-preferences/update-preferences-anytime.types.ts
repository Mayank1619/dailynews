/**
 * User Story 2: Update Preferences Anytime
 * Types for modifying existing user preferences
 */

import type { PreferenceProfile, Region } from "./types";

export type UpdatePreferencesAnytimeRequest = {
  userId: string;
  topics?: string[];
  region?: Region;
  deliveryTimeLocal?: string;
  timezone?: string;
};

export type UpdatePreferencesAnytimeResponse = {
  profile: PreferenceProfile;
  changedFields: (keyof PreferenceProfile)[];
};
