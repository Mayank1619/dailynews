/**
 * User Story 1: Complete First-Time Onboarding
 * Types for capturing initial user preferences
 */

import type { PreferenceProfile, Region } from "./types";

export type CompleteFirstTimeOnboardingRequest = {
  userId: string;
  topics: string[];
  region: Region;
  deliveryTimeLocal: string;
  timezone: string;
};

export type CompleteFirstTimeOnboardingResponse = {
  profile: PreferenceProfile;
  onboardingCompleted: boolean;
};

export type OnboardingStep = {
  id: 1 | 2 | 3;
  name: "topics" | "region" | "delivery-time";
  label: string;
  isComplete: boolean;
};

export type OnboardingProgress = {
  currentStep: number;
  steps: OnboardingStep[];
  completedSteps: number;
  isOnboardingComplete: boolean;
};
