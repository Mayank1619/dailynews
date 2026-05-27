/**
 * User Story 3: Pause or Resume Delivery
 * Types for toggling newsletter delivery without losing preferences
 */

import type { PreferenceProfile } from "./types";

export type PauseOrResumeDeliveryRequest = {
  userId: string;
  enabled: boolean;
};

export type PauseOrResumeDeliveryResponse = {
  profile: PreferenceProfile;
  deliveryEnabled: boolean;
  previouslyEnabled: boolean;
};
