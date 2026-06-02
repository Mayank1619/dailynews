import React from "react";
import { UnderstandDailyPaperImmediatelyPage } from "../features/public-site/understand-daily-paper-immediately";
import { DESIGN_TOKENS } from "../features/design-system/tokens";

export default function Page(): JSX.Element {
  return (
    <>
      <UnderstandDailyPaperImmediatelyPage />
      <div
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "flex-end"
        }}
      >
        <a
          data-testid="settings-link"
          href="/settings"
          style={{
            padding: "10px 14px",
            borderRadius: 999,
            background: "rgba(7,9,18,0.92)",
            border: "1px solid rgba(34,211,238,0.36)",
            color: DESIGN_TOKENS.colors.brandPrimary,
            textDecoration: "none",
            fontWeight: 800,
            boxShadow: "0 0 24px rgba(34,211,238,0.16)"
          }}
        >
          Settings
        </a>
        <a
          href="/onboarding"
          style={{
            padding: "10px 14px",
            borderRadius: 999,
            background: `linear-gradient(120deg, ${DESIGN_TOKENS.colors.brandPrimary}, ${DESIGN_TOKENS.colors.accentHighlight})`,
            color: "#07111F",
            textDecoration: "none",
            fontWeight: 800
          }}
        >
          Onboarding
        </a>
      </div>
    </>
  );
}
