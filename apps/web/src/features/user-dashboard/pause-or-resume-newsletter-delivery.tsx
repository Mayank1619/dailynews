import React from "react";
import { DESIGN_TOKENS } from "../design-system/tokens";

export const DELIVERY_TOGGLE_COPY = {
  pauseLabel: "Pause Newsletter",
  resumeLabel: "Resume Newsletter",
  activeState: "Active",
  pausedState: "Paused"
} as const;

export function getDeliveryToggleLabel(newsletterEnabled: boolean): string {
  return newsletterEnabled ? DELIVERY_TOGGLE_COPY.pauseLabel : DELIVERY_TOGGLE_COPY.resumeLabel;
}

export function getDeliveryStateLabel(newsletterEnabled: boolean): string {
  return newsletterEnabled ? DELIVERY_TOGGLE_COPY.activeState : DELIVERY_TOGGLE_COPY.pausedState;
}

export function PauseResumeButton(props: Readonly<{
  newsletterEnabled: boolean;
  onToggle?: () => void;
}>): React.JSX.Element {
  const destructive = props.newsletterEnabled;
  return (
    <button
      type="button"
      onClick={props.onToggle}
      style={{
        borderRadius: 10,
        border: "none",
        padding: "10px 14px",
        cursor: "pointer",
        background: destructive ? DESIGN_TOKENS.colors.error : DESIGN_TOKENS.colors.brandPrimary,
        color: DESIGN_TOKENS.colors.bgSecondary
      }}
    >
      {getDeliveryToggleLabel(props.newsletterEnabled)}
    </button>
  );
}
