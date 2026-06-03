import React from "react";
import { DESIGN_TOKENS } from "../design-system/tokens";

export const PAYMENTS_SUBSCRIPTIONS_COPY = {
  heading: "Your plan",
  plusPlanName: "Daily Paper Plus",
  trialBadge: "15-day free trial",
  monthlyPrice: "$4.99/mo",
  annualPrice: "$49/yr",
  trialDescription:
    "Try the full personalized AI paper for 15 days. After the trial, continue with a paid subscription.",
  includedHeading: "Included",
  upgradeLabel: "Continue with Plus",
  providerNotConfigured: "Checkout is ready for a payment provider link. Add Stripe configuration to enable live billing.",
  trialExpired: "Your free trial has ended. Choose a plan to continue newsletter delivery.",
} as const;

export type BillingInterval = "monthly" | "annual";

export type PlanStatusDisplayProps = {
  userId: string;
  trialDaysRemaining?: number;
  status?: "trialing" | "active" | "expired" | "past_due" | "canceled";
  selectedInterval?: BillingInterval;
  onSelectInterval?: (interval: BillingInterval) => void;
  onStartCheckout?: (interval: BillingInterval) => void;
};

const included = [
  "Personalized daily or weekly AI newsletter",
  "Detailed topic preferences",
  "Source-linked summaries",
  "Newsletter history and preference controls",
] as const;

export function PlanStatusDisplay({
  userId: _userId,
  trialDaysRemaining = 15,
  status = "trialing",
  selectedInterval = "monthly",
  onSelectInterval,
  onStartCheckout,
}: PlanStatusDisplayProps): React.ReactElement {
  const price = selectedInterval === "monthly"
    ? PAYMENTS_SUBSCRIPTIONS_COPY.monthlyPrice
    : PAYMENTS_SUBSCRIPTIONS_COPY.annualPrice;

  return (
    <section style={containerStyle} aria-label="Plan status">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "start" }}>
        <div>
          <p style={eyebrowStyle}>{PAYMENTS_SUBSCRIPTIONS_COPY.trialBadge}</p>
          <h2 style={headingStyle}>{PAYMENTS_SUBSCRIPTIONS_COPY.heading}</h2>
          <p style={descriptionStyle}>{PAYMENTS_SUBSCRIPTIONS_COPY.trialDescription}</p>
        </div>
        <div style={priceStyle}>
          <strong>{price}</strong>
          <span>{selectedInterval === "monthly" ? "Monthly" : "Annual"}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, margin: "18px 0" }}>
        <div style={statStyle}>
          Status<br />
          <strong>{status === "trialing" ? "Trial" : status}</strong>
        </div>
        <div style={statStyle}>
          Trial left<br />
          <strong>{status === "trialing" ? `${trialDaysRemaining} days` : "0 days"}</strong>
        </div>
      </div>

      {status === "expired" ? (
        <p style={{ color: DESIGN_TOKENS.colors.warning }}>{PAYMENTS_SUBSCRIPTIONS_COPY.trialExpired}</p>
      ) : null}

      <fieldset style={fieldsetStyle}>
        <legend>Billing</legend>
        {(["monthly", "annual"] as const).map((interval) => (
          <label key={interval} style={radioCardStyle(selectedInterval === interval)}>
            <input
              type="radio"
              name="billing-interval"
              value={interval}
              checked={selectedInterval === interval}
              onChange={() => onSelectInterval?.(interval)}
            />
            <span>{interval === "monthly" ? "Monthly" : "Annual"}</span>
            <strong>{interval === "monthly" ? PAYMENTS_SUBSCRIPTIONS_COPY.monthlyPrice : PAYMENTS_SUBSCRIPTIONS_COPY.annualPrice}</strong>
          </label>
        ))}
      </fieldset>

      <section>
        <h3 style={{ font: DESIGN_TOKENS.typography.h3, margin: "18px 0 8px" }}>{PAYMENTS_SUBSCRIPTIONS_COPY.includedHeading}</h3>
        <ul style={{ display: "grid", gap: 8, paddingLeft: 18, color: DESIGN_TOKENS.colors.textSecondary }}>
          {included.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <button
        type="button"
        onClick={() => onStartCheckout?.(selectedInterval)}
        style={primaryButtonStyle}
      >
        {PAYMENTS_SUBSCRIPTIONS_COPY.upgradeLabel}
      </button>
    </section>
  );
}

const containerStyle: React.CSSProperties = {
  color: DESIGN_TOKENS.colors.textPrimary,
  background: "rgba(7,9,18,0.72)",
  border: "1px solid rgba(34,211,238,0.24)",
  padding: 20,
  borderRadius: 14,
};

const eyebrowStyle: React.CSSProperties = {
  margin: "0 0 6px",
  color: DESIGN_TOKENS.colors.accentHighlight,
  fontWeight: 900,
};

const headingStyle: React.CSSProperties = {
  font: DESIGN_TOKENS.typography.h2,
  margin: 0,
};

const descriptionStyle: React.CSSProperties = {
  color: DESIGN_TOKENS.colors.textSecondary,
  maxWidth: 620,
};

const priceStyle: React.CSSProperties = {
  display: "grid",
  gap: 2,
  minWidth: 120,
  padding: 14,
  borderRadius: 12,
  background: "rgba(34,211,238,0.12)",
  border: "1px solid rgba(34,211,238,0.28)",
};

const statStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 12,
  background: "rgba(17,24,39,0.82)",
  border: "1px solid rgba(167,179,200,0.16)",
};

const fieldsetStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
  border: "1px solid rgba(34,211,238,0.24)",
  borderRadius: 12,
  padding: 12,
};

function radioCardStyle(selected: boolean): React.CSSProperties {
  return {
    display: "grid",
    gap: 4,
    padding: 12,
    borderRadius: 12,
    cursor: "pointer",
    border: `1px solid ${selected ? "rgba(34,211,238,0.88)" : "rgba(167,179,200,0.22)"}`,
    background: selected ? "rgba(34,211,238,0.14)" : "rgba(17,24,39,0.68)",
  };
}

const primaryButtonStyle: React.CSSProperties = {
  marginTop: 18,
  border: 0,
  borderRadius: 999,
  padding: "12px 16px",
  cursor: "pointer",
  background: `linear-gradient(120deg, ${DESIGN_TOKENS.colors.brandPrimary}, ${DESIGN_TOKENS.colors.brandSecondary})`,
  color: "#07111F",
  fontWeight: 900,
};
