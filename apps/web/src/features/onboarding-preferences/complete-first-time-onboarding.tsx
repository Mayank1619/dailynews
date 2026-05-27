/**
 * Complete First-Time Onboarding Component
 * Step-by-step preference capture during signup/onboarding
 */

"use client";

import { useState } from "react";
import { DESIGN_TOKENS } from "../design-system/tokens";
import type { PreferenceProfile, Region } from "../../api/src/features/onboarding-preferences/types";

interface CompleteFirstTimeOnboardingProps {
  userId: string;
  onComplete?: (profile: PreferenceProfile) => void;
  onError?: (error: Error) => void;
}

type OnboardingStep = "topics" | "region" | "delivery-time" | "review";

interface FormData {
  topics: Set<string>;
  region: Region;
  deliveryTime: string;
  timezone: string;
}

const AVAILABLE_TOPICS = [
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

const AVAILABLE_TIMEZONES = [
  { label: "Eastern (Toronto)", value: "America/Toronto" },
  { label: "Central (Winnipeg)", value: "America/Winnipeg" },
  { label: "Mountain (Edmonton)", value: "America/Edmonton" },
  { label: "Pacific (Vancouver)", value: "America/Vancouver" },
  { label: "UTC", value: "UTC" }
];

export function CompleteFirstTimeOnboarding({
  userId,
  onComplete,
  onError
}: CompleteFirstTimeOnboardingProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("topics");
  const [formData, setFormData] = useState<FormData>({
    topics: new Set(),
    region: { country: "Canada" },
    deliveryTime: "08:00",
    timezone: "America/Toronto"
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const steps: { step: OnboardingStep; label: string }[] = [
    { step: "topics", label: "Select Topics" },
    { step: "region", label: "Your Region" },
    { step: "delivery-time", label: "Delivery Time" },
    { step: "review", label: "Review" }
  ];

  const currentStepIndex = steps.findIndex((s) => s.step === currentStep);

  const toggleTopic = (topic: string) => {
    const newTopics = new Set(formData.topics);
    if (newTopics.has(topic)) {
      newTopics.delete(topic);
    } else {
      newTopics.add(topic);
    }
    setFormData({ ...formData, topics: newTopics });
  };

  const handleNext = () => {
    // Validate current step
    if (currentStep === "topics" && formData.topics.size === 0) {
      setError("Please select at least one topic");
      return;
    }

    // Move to next step
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].step);
      setError(null);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].step);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          topics: Array.from(formData.topics),
          region: formData.region,
          deliveryTimeLocal: formData.deliveryTime,
          timezone: formData.timezone
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save preferences");
      }

      const data = await response.json();
      onComplete?.(data.profile);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error.message);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: `${DESIGN_TOKENS.layout.maxContentWidth}px`,
        margin: "0 auto",
        padding: `${DESIGN_TOKENS.spacing[3]}px`,
        fontFamily: DESIGN_TOKENS.typography.bodyFamily,
        backgroundColor: DESIGN_TOKENS.colors.bgPrimary
      }}
    >
      {/* Header */}
      <h1
        style={{
          font: DESIGN_TOKENS.typography.h1,
          color: DESIGN_TOKENS.colors.textPrimary,
          marginBottom: `${DESIGN_TOKENS.spacing[3]}px`
        }}
      >
        Personalize Your Daily News
      </h1>

      {/* Progress */}
      <div
        style={{
          display: "flex",
          gap: `${DESIGN_TOKENS.spacing[2]}px`,
          marginBottom: `${DESIGN_TOKENS.spacing[4]}px`
        }}
      >
        {steps.map((s, idx) => (
          <div
            key={s.step}
            style={{
              padding: `${DESIGN_TOKENS.spacing[2]}px ${DESIGN_TOKENS.spacing[3]}px`,
              backgroundColor:
                idx <= currentStepIndex
                  ? DESIGN_TOKENS.colors.brandPrimary
                  : DESIGN_TOKENS.colors.bgSecondary,
              color:
                idx <= currentStepIndex
                  ? DESIGN_TOKENS.colors.bgSecondary
                  : DESIGN_TOKENS.colors.textSecondary,
              borderRadius: "4px",
              fontSize: "14px",
              cursor: idx < currentStepIndex ? "pointer" : "default"
            }}
            onClick={() => idx < currentStepIndex && setCurrentStep(s.step)}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: `${DESIGN_TOKENS.spacing[2]}px`,
            marginBottom: `${DESIGN_TOKENS.spacing[3]}px`,
            backgroundColor: DESIGN_TOKENS.colors.error,
            color: DESIGN_TOKENS.colors.bgSecondary,
            borderRadius: "4px"
          }}
        >
          {error}
        </div>
      )}

      {/* Step Content */}
      <div style={{ minHeight: "200px", marginBottom: `${DESIGN_TOKENS.spacing[4]}px` }}>
        {currentStep === "topics" && (
          <div>
            <h2 style={{ font: DESIGN_TOKENS.typography.h2, marginBottom: `${DESIGN_TOKENS.spacing[3]}px` }}>
              What topics interest you?
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: `${DESIGN_TOKENS.spacing[2]}px`
              }}
            >
              {AVAILABLE_TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  style={{
                    padding: `${DESIGN_TOKENS.spacing[2]}px`,
                    backgroundColor: formData.topics.has(topic)
                      ? DESIGN_TOKENS.colors.brandPrimary
                      : DESIGN_TOKENS.colors.bgSecondary,
                    color: formData.topics.has(topic)
                      ? DESIGN_TOKENS.colors.bgSecondary
                      : DESIGN_TOKENS.colors.textPrimary,
                    border: `2px solid ${DESIGN_TOKENS.colors.brandPrimary}`,
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: formData.topics.has(topic) ? "600" : "400",
                    transition: `all ${DESIGN_TOKENS.interaction.transitionMs}ms ease`
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === "region" && (
          <div>
            <h2 style={{ font: DESIGN_TOKENS.typography.h2, marginBottom: `${DESIGN_TOKENS.spacing[3]}px` }}>
              Select your region
            </h2>
            <div style={{ marginBottom: `${DESIGN_TOKENS.spacing[3]}px` }}>
              <label style={{ display: "block", marginBottom: `${DESIGN_TOKENS.spacing[2]}px` }}>
                Country
              </label>
              <select
                value={formData.region.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    region: { ...formData.region, country: e.target.value }
                  })
                }
                style={{
                  width: "100%",
                  padding: `${DESIGN_TOKENS.spacing[2]}px`,
                  border: `1px solid ${DESIGN_TOKENS.colors.brandPrimary}`,
                  borderRadius: "4px"
                }}
              >
                <option>Canada</option>
              </select>
            </div>

            <div style={{ marginBottom: `${DESIGN_TOKENS.spacing[3]}px` }}>
              <label style={{ display: "block", marginBottom: `${DESIGN_TOKENS.spacing[2]}px` }}>
                Province (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Ontario"
                value={formData.region.province || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    region: { ...formData.region, province: e.target.value || undefined }
                  })
                }
                style={{
                  width: "100%",
                  padding: `${DESIGN_TOKENS.spacing[2]}px`,
                  border: `1px solid ${DESIGN_TOKENS.colors.brandPrimary}`,
                  borderRadius: "4px"
                }}
              />
            </div>
          </div>
        )}

        {currentStep === "delivery-time" && (
          <div>
            <h2 style={{ font: DESIGN_TOKENS.typography.h2, marginBottom: `${DESIGN_TOKENS.spacing[3]}px` }}>
              When should we deliver?
            </h2>
            <div style={{ marginBottom: `${DESIGN_TOKENS.spacing[3]}px` }}>
              <label style={{ display: "block", marginBottom: `${DESIGN_TOKENS.spacing[2]}px` }}>
                Time
              </label>
              <input
                type="time"
                value={formData.deliveryTime}
                onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                style={{
                  width: "100%",
                  padding: `${DESIGN_TOKENS.spacing[2]}px`,
                  border: `1px solid ${DESIGN_TOKENS.colors.brandPrimary}`,
                  borderRadius: "4px"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: `${DESIGN_TOKENS.spacing[2]}px` }}>
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                style={{
                  width: "100%",
                  padding: `${DESIGN_TOKENS.spacing[2]}px`,
                  border: `1px solid ${DESIGN_TOKENS.colors.brandPrimary}`,
                  borderRadius: "4px"
                }}
              >
                {AVAILABLE_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {currentStep === "review" && (
          <div>
            <h2 style={{ font: DESIGN_TOKENS.typography.h2, marginBottom: `${DESIGN_TOKENS.spacing[3]}px` }}>
              Review your preferences
            </h2>
            <div style={{ backgroundColor: DESIGN_TOKENS.colors.bgSecondary, padding: `${DESIGN_TOKENS.spacing[3]}px`, borderRadius: "4px" }}>
              <p>
                <strong>Topics:</strong> {Array.from(formData.topics).join(", ")}
              </p>
              <p>
                <strong>Region:</strong> {formData.region.country}
                {formData.region.province && `, ${formData.region.province}`}
              </p>
              <p>
                <strong>Delivery:</strong> {formData.deliveryTime} {formData.timezone}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          gap: `${DESIGN_TOKENS.spacing[2]}px`,
          justifyContent: "space-between"
        }}
      >
        <button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0 || loading}
          style={{
            padding: `${DESIGN_TOKENS.spacing[2]}px ${DESIGN_TOKENS.spacing[3]}px`,
            backgroundColor: currentStepIndex === 0 ? DESIGN_TOKENS.colors.bgSecondary : DESIGN_TOKENS.colors.brandPrimary,
            color: currentStepIndex === 0 ? DESIGN_TOKENS.colors.textSecondary : DESIGN_TOKENS.colors.bgSecondary,
            border: "none",
            borderRadius: "4px",
            cursor: currentStepIndex === 0 ? "not-allowed" : "pointer",
            opacity: currentStepIndex === 0 ? 0.5 : 1
          }}
        >
          Previous
        </button>

        {currentStep !== "review" ? (
          <button
            onClick={handleNext}
            style={{
              padding: `${DESIGN_TOKENS.spacing[2]}px ${DESIGN_TOKENS.spacing[3]}px`,
              backgroundColor: DESIGN_TOKENS.colors.brandPrimary,
              color: DESIGN_TOKENS.colors.bgSecondary,
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: `${DESIGN_TOKENS.spacing[2]}px ${DESIGN_TOKENS.spacing[3]}px`,
              backgroundColor: loading ? DESIGN_TOKENS.colors.brandSecondary : DESIGN_TOKENS.colors.brandPrimary,
              color: DESIGN_TOKENS.colors.bgSecondary,
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "Saving..." : "Complete Onboarding"}
          </button>
        )}
      </div>
    </div>
  );
}
