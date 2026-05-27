/**
 * Update Preferences Anytime Component
 * Allows users to modify existing preferences
 */

"use client";

import { useEffect, useState } from "react";
import { DESIGN_TOKENS } from "../design-system/tokens";
import type { PreferenceProfile, Region } from "../../api/src/features/onboarding-preferences/types";

interface UpdatePreferencesAnytimeProps {
  userId: string;
  onUpdate?: (profile: PreferenceProfile) => void;
  onError?: (error: Error) => void;
}

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

export function UpdatePreferencesAnytime({
  userId,
  onUpdate,
  onError
}: UpdatePreferencesAnytimeProps) {
  const [formData, setFormData] = useState<FormData>({
    topics: new Set(),
    region: { country: "Canada" },
    deliveryTime: "08:00",
    timezone: "America/Toronto"
  });
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load current preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch("/api/preferences", {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
          throw new Error("Failed to load preferences");
        }

        const data = await response.json();
        if (data.profile) {
          const loaded: FormData = {
            topics: new Set(data.profile.topics),
            region: data.profile.region,
            deliveryTime: data.profile.deliveryTimeLocal,
            timezone: data.profile.timezone
          };
          setFormData(loaded);
          setOriginalData(loaded);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to load preferences");
        setError(error.message);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [userId, onError]);

  const toggleTopic = (topic: string) => {
    const newTopics = new Set(formData.topics);
    if (newTopics.has(topic)) {
      newTopics.delete(topic);
    } else {
      newTopics.add(topic);
    }
    setFormData({ ...formData, topics: newTopics });
    setSuccess(false);
  };

  const hasChanges = (): boolean => {
    if (!originalData) return false;
    return (
      JSON.stringify(Array.from(formData.topics).sort()) !==
        JSON.stringify(Array.from(originalData.topics).sort()) ||
      JSON.stringify(formData.region) !== JSON.stringify(originalData.region) ||
      formData.deliveryTime !== originalData.deliveryTime ||
      formData.timezone !== originalData.timezone
    );
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      setError("No changes to save");
      return;
    }

    if (formData.topics.size === 0) {
      setError("Please select at least one topic");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

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
      setOriginalData(formData);
      setSuccess(true);
      onUpdate?.(data.profile);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error.message);
      onError?.(error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setError(null);
      setSuccess(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          maxWidth: `${DESIGN_TOKENS.layout.maxContentWidth}px`,
          margin: "0 auto",
          padding: `${DESIGN_TOKENS.spacing[3]}px`,
          textAlign: "center"
        }}
      >
        Loading preferences...
      </div>
    );
  }

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
        Update Your Preferences
      </h1>

      {/* Messages */}
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

      {success && (
        <div
          style={{
            padding: `${DESIGN_TOKENS.spacing[2]}px`,
            marginBottom: `${DESIGN_TOKENS.spacing[3]}px`,
            backgroundColor: DESIGN_TOKENS.colors.success,
            color: DESIGN_TOKENS.colors.bgSecondary,
            borderRadius: "4px"
          }}
        >
          Preferences updated successfully!
        </div>
      )}

      {/* Topics Section */}
      <div style={{ marginBottom: `${DESIGN_TOKENS.spacing[4]}px` }}>
        <h2 style={{ font: DESIGN_TOKENS.typography.h2, marginBottom: `${DESIGN_TOKENS.spacing[3]}px` }}>
          Topics
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

      {/* Region Section */}
      <div style={{ marginBottom: `${DESIGN_TOKENS.spacing[4]}px` }}>
        <h2 style={{ font: DESIGN_TOKENS.typography.h2, marginBottom: `${DESIGN_TOKENS.spacing[3]}px` }}>
          Region
        </h2>
        <div style={{ marginBottom: `${DESIGN_TOKENS.spacing[2]}px` }}>
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

        <div>
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

      {/* Delivery Section */}
      <div style={{ marginBottom: `${DESIGN_TOKENS.spacing[4]}px` }}>
        <h2 style={{ font: DESIGN_TOKENS.typography.h2, marginBottom: `${DESIGN_TOKENS.spacing[3]}px` }}>
          Delivery Preferences
        </h2>
        <div style={{ marginBottom: `${DESIGN_TOKENS.spacing[2]}px` }}>
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

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: `${DESIGN_TOKENS.spacing[2]}px`,
          justifyContent: "flex-end"
        }}
      >
        <button
          onClick={handleReset}
          disabled={!hasChanges() || saving}
          style={{
            padding: `${DESIGN_TOKENS.spacing[2]}px ${DESIGN_TOKENS.spacing[3]}px`,
            backgroundColor: !hasChanges() ? DESIGN_TOKENS.colors.bgSecondary : DESIGN_TOKENS.colors.warning,
            color: !hasChanges() ? DESIGN_TOKENS.colors.textSecondary : DESIGN_TOKENS.colors.bgSecondary,
            border: "none",
            borderRadius: "4px",
            cursor: !hasChanges() || saving ? "not-allowed" : "pointer",
            opacity: !hasChanges() || saving ? 0.5 : 1
          }}
        >
          Reset
        </button>

        <button
          onClick={handleSave}
          disabled={!hasChanges() || saving}
          style={{
            padding: `${DESIGN_TOKENS.spacing[2]}px ${DESIGN_TOKENS.spacing[3]}px`,
            backgroundColor: !hasChanges() ? DESIGN_TOKENS.colors.brandSecondary : DESIGN_TOKENS.colors.brandPrimary,
            color: DESIGN_TOKENS.colors.bgSecondary,
            border: "none",
            borderRadius: "4px",
            cursor: !hasChanges() || saving ? "not-allowed" : "pointer",
            opacity: !hasChanges() || saving ? 0.5 : 1
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
