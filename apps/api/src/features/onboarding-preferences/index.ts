/**
 * Onboarding Preferences - Public API
 * Exports all services, types, and utilities
 */

// Types
export * from "./types";
export * from "./complete-first-time-onboarding.types";
export * from "./update-preferences-anytime.types";
export * from "./pause-or-resume-delivery.types";

// Services
export { CompleteFirstTimeOnboardingService } from "./complete-first-time-onboarding.service";
export { UpdatePreferencesAnytimeService } from "./update-preferences-anytime.service";
export { PauseOrResumeDeliveryService } from "./pause-or-resume-delivery.service";

// Repository
export {
  FirestorePreferencesRepository,
  MockPreferencesRepository,
  type IPreferencesRepository
} from "./preferencesRepository";

// Telemetry
export {
  OnboardingPreferencesTelemetry,
  type PreferencesTelemetrySink,
  type OnboardingPreferencesTelemetryEvent
} from "./telemetry";

// Validation
export {
  PreferenceValidator,
  validateTopicsPresent,
  validateTimeFormat,
  validateRegionDefault
} from "./validator";

// Feature-specific telemetry
export { CompleteFirstTimeOnboardingTelemetry } from "./complete-first-time-onboarding.telemetry";
export { UpdatePreferencesAnytimeTelemetry } from "./update-preferences-anytime.telemetry";
export { PauseOrResumeDeliveryTelemetry } from "./pause-or-resume-delivery.telemetry";
