/**
 * Payments / Subscriptions - Phase 2 Placeholder Frontend Component
 *
 * Phase 1 presents free-tier access status only.
 * No checkout, upgrade, or paid plan flows are shown in Phase 1.
 * Premium feature flags remain inactive and are not surfaced to users.
 */

import React from "react";
import { DESIGN_TOKENS } from "../design-system/tokens";

/** Copy constants for the plan-status component - Phase 1 free-tier only. */
export const PAYMENTS_SUBSCRIPTIONS_COPY = {
  heading: "Your plan",
  currentPlanLabel: "Current plan:",
  freePlanName: "Free",
  freePlanDescription:
    "You have full access to Daily Paper at no cost. No payment information is required.",
  premiumComingSoon:
    "Premium options may be introduced in a future update. Free access will always remain available.",
  noPaymentRequired: "No payment required",
  planStatusLabel: "Plan status:",
  activeStatus: "Active",
} as const;

export type PlanStatusDisplayProps = {
  userId: string;
};

/**
 * Displays the user's current plan status.
 * In Phase 1, all users are on the free plan.
 * No purchase or upgrade flow is presented.
 */
export function PlanStatusDisplay({ userId: _userId }: PlanStatusDisplayProps): React.ReactElement {
  const containerStyle: React.CSSProperties = {
    fontFamily: DESIGN_TOKENS.typography.bodyFamily,
    color: DESIGN_TOKENS.colors.textPrimary,
    backgroundColor: DESIGN_TOKENS.colors.bgSecondary,
    padding: "1.5rem",
    borderRadius: "0.5rem",
    maxWidth: DESIGN_TOKENS.layout.maxContentWidth,
  };

  const headingStyle: React.CSSProperties = {
    font: DESIGN_TOKENS.typography.h2,
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: "1rem",
  };

  const planBadgeStyle: React.CSSProperties = {
    display: "inline-block",
    backgroundColor: DESIGN_TOKENS.colors.success,
    color: DESIGN_TOKENS.colors.bgPrimary,
    padding: "0.25rem 0.75rem",
    borderRadius: "1rem",
    font: DESIGN_TOKENS.typography.body,
    fontWeight: "bold",
    marginBottom: "0.75rem",
  };

  const descriptionStyle: React.CSSProperties = {
    font: DESIGN_TOKENS.typography.body,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: "0.5rem",
  };

  const comingSoonStyle: React.CSSProperties = {
    font: DESIGN_TOKENS.typography.body,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontStyle: "italic",
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: `1px solid ${DESIGN_TOKENS.colors.bgPrimary}`,
  };

  return (
    <section style={containerStyle} aria-label="Plan status">
      <h2 style={headingStyle}>{PAYMENTS_SUBSCRIPTIONS_COPY.heading}</h2>
      <div>
        <span>{PAYMENTS_SUBSCRIPTIONS_COPY.currentPlanLabel} </span>
        <span style={planBadgeStyle}>{PAYMENTS_SUBSCRIPTIONS_COPY.freePlanName}</span>
      </div>
      <p style={descriptionStyle}>{PAYMENTS_SUBSCRIPTIONS_COPY.freePlanDescription}</p>
      <p style={descriptionStyle}>
        <strong>{PAYMENTS_SUBSCRIPTIONS_COPY.planStatusLabel}</strong>{" "}
        {PAYMENTS_SUBSCRIPTIONS_COPY.activeStatus}
      </p>
      <p style={descriptionStyle}>
        <em>{PAYMENTS_SUBSCRIPTIONS_COPY.noPaymentRequired}</em>
      </p>
      <p style={comingSoonStyle}>{PAYMENTS_SUBSCRIPTIONS_COPY.premiumComingSoon}</p>
    </section>
  );
}
