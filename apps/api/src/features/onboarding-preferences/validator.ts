/**
 * Preference Validation Utilities
 * Validates user selections against business rules and constraints
 */

import type { ValidationResult, ValidationError, Region } from "./types";

// Default approved topic taxonomy
const DEFAULT_TOPIC_TAXONOMY = [
  "Technology",
  "Business",
  "Science",
  "Health",
  "Sports",
  "Entertainment",
  "Politics",
  "World News",
  "Finance",
  "Lifestyle"
];

// Valid timezones (sample)
const VALID_TIMEZONES = [
  "America/Toronto",
  "America/Vancouver",
  "America/Edmonton",
  "America/Winnipeg",
  "America/Chicago",
  "America/New_York",
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney"
];

export class PreferenceValidator {
  constructor(private readonly topicTaxonomy: string[] = DEFAULT_TOPIC_TAXONOMY) {}

  validateTopicSelection(topics: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (!Array.isArray(topics)) {
      errors.push({
        field: "topics",
        message: "Topics must be an array"
      });
      return { valid: false, errors };
    }

    if (topics.length === 0) {
      errors.push({
        field: "topics",
        message: "At least one topic must be selected"
      });
      return { valid: false, errors };
    }

    const invalidTopics = topics.filter((t: unknown) => !this.topicTaxonomy.includes(t as string));
    if (invalidTopics.length > 0) {
      errors.push({
        field: "topics",
        message: `Invalid topics selected: ${invalidTopics.join(", ")}`
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateRegion(region: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (!region || typeof region !== "object") {
      errors.push({
        field: "region",
        message: "Region is required and must be an object"
      });
      return { valid: false, errors };
    }

    const regionObj = region as Record<string, unknown>;

    if (!regionObj.country || typeof regionObj.country !== "string") {
      errors.push({
        field: "region.country",
        message: "Country is required"
      });
    }

    if (regionObj.province && typeof regionObj.province !== "string") {
      errors.push({
        field: "region.province",
        message: "Province must be a string"
      });
    }

    if (regionObj.city && typeof regionObj.city !== "string") {
      errors.push({
        field: "region.city",
        message: "City must be a string"
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateDeliveryTime(deliveryTime: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (!deliveryTime || typeof deliveryTime !== "string") {
      errors.push({
        field: "deliveryTime",
        message: "Delivery time is required and must be a string (HH:MM format)"
      });
      return { valid: false, errors };
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(deliveryTime)) {
      errors.push({
        field: "deliveryTime",
        message: "Delivery time must be in HH:MM format (e.g., 08:00)"
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateTimezone(timezone: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (!timezone || typeof timezone !== "string") {
      errors.push({
        field: "timezone",
        message: "Timezone is required and must be a string"
      });
      return { valid: false, errors };
    }

    if (!VALID_TIMEZONES.includes(timezone)) {
      errors.push({
        field: "timezone",
        message: `Invalid timezone. Must be one of: ${VALID_TIMEZONES.join(", ")}`
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateCompletePreferences(data: {
    topics?: unknown;
    region?: unknown;
    deliveryTime?: unknown;
    timezone?: unknown;
  }): ValidationResult {
    const errors: ValidationError[] = [];

    // All fields required for save
    const topicsValidation = this.validateTopicSelection(data.topics);
    const regionValidation = this.validateRegion(data.region);
    const deliveryValidation = this.validateDeliveryTime(data.deliveryTime);
    const timezoneValidation = this.validateTimezone(data.timezone);

    errors.push(
      ...topicsValidation.errors,
      ...regionValidation.errors,
      ...deliveryValidation.errors,
      ...timezoneValidation.errors
    );

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export function validateTopicsPresent(topics: string[]): boolean {
  return Array.isArray(topics) && topics.length > 0;
}

export function validateTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

export function validateRegionDefault(): Region {
  return {
    country: "Canada"
  };
}
