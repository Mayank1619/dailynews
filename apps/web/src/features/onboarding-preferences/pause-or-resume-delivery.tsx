/**
 * Pause or Resume Delivery Component
 * Allows users to toggle newsletter delivery
 */

"use client";

import { useEffect, useState } from "react";
import { DESIGN_TOKENS } from "../design-system/tokens";
import type { PreferenceProfile } from "../../api/src/features/onboarding-preferences/types";

interface PauseOrResumeDeliveryProps {
  userId: string;
  onToggle?: (enabled: boolean, profile: PreferenceProfile) => void;
  onError?: (error: Error) => void;
}

export function PauseOrResumeDelivery({
  userId,
  onToggle,
  onError
}: PauseOrResumeDeliveryProps) {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<PreferenceProfile | null>(null);

  // Load current delivery status
  useEffect(() => {
    const loadStatus = async () => {
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
          setEnabled(data.profile.newsletterEnabled ?? true);
          setProfile(data.profile);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to load status");
        setError(error.message);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [userId, onError]);

  const handleToggle = async () => {
    setToggling(true);
    setError(null);

    try {
      const response = await fetch("/api/preferences/toggle-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          enabled: !enabled
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to toggle delivery");
      }

      const data = await response.json();
      setEnabled(!enabled);
      setProfile(data.profile);
      onToggle?.(!enabled, data.profile);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error.message);
      onError?.(error);
    } finally {
      setToggling(false);
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
        Loading...
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
      <h2
        style={{
          font: DESIGN_TOKENS.typography.h2,
          color: DESIGN_TOKENS.colors.textPrimary,
          marginBottom: `${DESIGN_TOKENS.spacing[3]}px`
        }}
      >
        Newsletter Delivery
      </h2>

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

      {/* Content */}
      <div
        style={{
          backgroundColor: DESIGN_TOKENS.colors.bgSecondary,
          padding: `${DESIGN_TOKENS.spacing[3]}px`,
          borderRadius: "8px",
          border: `1px solid ${DESIGN_TOKENS.colors.brandPrimary}`,
          marginBottom: `${DESIGN_TOKENS.spacing[3]}px`
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: `${DESIGN_TOKENS.spacing[3]}px`
          }}
        >
          <div>
            <h3 style={{ font: DESIGN_TOKENS.typography.h3, marginBottom: `${DESIGN_TOKENS.spacing[2]}px` }}>
              {enabled ? "Delivery Active" : "Delivery Paused"}
            </h3>
            <p style={{ color: DESIGN_TOKENS.colors.textSecondary, fontSize: "14px" }}>
              {enabled
                ? "You're receiving your daily newsletter."
                : "Your newsletter is paused. Your preferences are saved and will be used when you resume."}
            </p>
          </div>

          {/* Toggle Switch */}
          <div
            style={{
              position: "relative",
              width: "70px",
              height: "34px"
            }}
          >
            <input
              type="checkbox"
              checked={enabled}
              onChange={handleToggle}
              disabled={toggling}
              style={{
                position: "absolute",
                opacity: 0,
                cursor: toggling ? "not-allowed" : "pointer",
                width: "100%",
                height: "100%"
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: enabled
                  ? DESIGN_TOKENS.colors.success
                  : DESIGN_TOKENS.colors.textSecondary,
                borderRadius: "17px",
                transition: `background-color ${DESIGN_TOKENS.interaction.transitionMs}ms`,
                pointerEvents: "none",
                opacity: toggling ? 0.6 : 1
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "2px",
                  left: enabled ? "37px" : "2px",
                  width: "30px",
                  height: "30px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  transition: `left ${DESIGN_TOKENS.interaction.transitionMs}ms`,
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
                }}
              />
            </div>
          </div>
        </div>

        {/* Preferences Summary */}
        {profile && (
          <div
            style={{
              backgroundColor: DESIGN_TOKENS.colors.bgPrimary,
              padding: `${DESIGN_TOKENS.spacing[2]}px`,
              borderRadius: "4px",
              marginTop: `${DESIGN_TOKENS.spacing[2]}px`
            }}
          >
            <p style={{ fontSize: "12px", color: DESIGN_TOKENS.colors.textSecondary, marginBottom: "8px" }}>
              <strong>Saved Preferences:</strong>
            </p>
            <p style={{ fontSize: "12px", marginBottom: "4px" }}>
              <strong>Topics:</strong> {profile.topics.join(", ")}
            </p>
            <p style={{ fontSize: "12px", marginBottom: "4px" }}>
              <strong>Region:</strong> {profile.region.country}
              {profile.region.province && `, ${profile.region.province}`}
            </p>
            <p style={{ fontSize: "12px" }}>
              <strong>Delivery Time:</strong> {profile.deliveryTimeLocal}
            </p>
          </div>
        )}
      </div>

      {/* Info Message */}
      <div
        style={{
          padding: `${DESIGN_TOKENS.spacing[2]}px`,
          backgroundColor: `${DESIGN_TOKENS.colors.brandPrimary}20`,
          border: `1px solid ${DESIGN_TOKENS.colors.brandPrimary}`,
          borderRadius: "4px",
          fontSize: "14px",
          color: DESIGN_TOKENS.colors.textPrimary
        }}
      >
        <strong>💡 Tip:</strong> Your preferences are always saved. Pausing delivery won't delete
        your selected topics, region, or delivery time. Simply toggle back on to resume.
      </div>
    </div>
  );
}
