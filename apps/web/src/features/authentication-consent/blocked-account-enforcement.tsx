import React from "react";
import { DESIGN_TOKENS } from "../design-system/tokens";

export const BLOCKED_ACCOUNT_COPY = {
  message: "Your account has been suspended. Contact support."
} as const;

const bannerStyle: React.CSSProperties = {
  background: DESIGN_TOKENS.colors.accentHighlight,
  color: DESIGN_TOKENS.colors.bgSecondary,
  borderRadius: 10,
  padding: `${DESIGN_TOKENS.spacing[1]}px ${DESIGN_TOKENS.spacing[2]}px`,
  fontWeight: 600,
  font: DESIGN_TOKENS.typography.body,
  textAlign: "center",
  maxWidth: 480,
  margin: "0 auto"
};

export function BlockedAccountBanner(): React.JSX.Element {
  return (
    <div role="alert" style={bannerStyle}>
      {BLOCKED_ACCOUNT_COPY.message}
    </div>
  );
}
