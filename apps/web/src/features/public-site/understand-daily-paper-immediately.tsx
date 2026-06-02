import React from "react";
import { PublicSiteLandingService } from "../../../../api/src/features/public-site/understand-daily-paper-immediately.service";
import { createPublicSiteAuditEvent } from "../../../../api/src/features/public-site/understand-daily-paper-immediately.telemetry";
import { DESIGN_TOKENS } from "../design-system/tokens";
import {
  FOOTER_TRUST_LINKS,
  HOW_IT_WORKS_STEPS,
  PUBLIC_NAV_ACTIONS,
  SAMPLE_DIGEST_PREVIEW
} from "./contracts";
import { ReachSignupAndLoginQuicklyActions } from "./reach-signup-and-login-quickly";
import { buildPublicLandingSeo } from "./seo";
import { createLandingHealthEvent } from "./telemetry";

const service = new PublicSiteLandingService();

export function UnderstandDailyPaperImmediatelyPage(): React.JSX.Element {
  const hero = service.buildHeroContent();
  const layout = service.assessHeroLayout(1280);
  const seo = buildPublicLandingSeo();

  const auditEvent = createPublicSiteAuditEvent("public-landing-rendered", "success", {
    route: "/",
    ctaRoute: hero.primaryCta.route,
    readableOnDesktop: layout.readableOnDesktop,
    readableOnMobile: layout.readableOnMobile
  });

  const healthEvent = createLandingHealthEvent("landing-page-available", "success", {
    route: "/",
    hasSignupAction: PUBLIC_NAV_ACTIONS.some((action) => action.route === "/signup"),
    hasLoginAction: PUBLIC_NAV_ACTIONS.some((action) => action.route === "/login"),
    hasBlogAction: PUBLIC_NAV_ACTIONS.some((action) => action.route === "/blog")
  });

  return (
    <main
      style={{
        maxWidth: DESIGN_TOKENS.layout.maxContentWidth,
        margin: "0 auto",
        padding: `${DESIGN_TOKENS.spacing[2]}px ${DESIGN_TOKENS.spacing[1]}px ${DESIGN_TOKENS.spacing[2]}px`,
        font: DESIGN_TOKENS.typography.body,
        color: DESIGN_TOKENS.colors.textPrimary,
        background:
          "radial-gradient(circle at 8% 0%, rgba(34,211,238,0.28), transparent 34%), radial-gradient(circle at 92% 8%, rgba(168,85,247,0.26), transparent 36%), radial-gradient(circle at 50% 100%, rgba(244,114,182,0.16), transparent 34%), linear-gradient(180deg, #070912 0%, #0B1020 100%)",
        minHeight: "100vh"
      }}
      data-seo-title={seo.title}
      data-seo-description={seo.description}
      data-audit-event={auditEvent.eventName}
      data-health-event={healthEvent.eventName}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: DESIGN_TOKENS.spacing[0],
          flexWrap: "wrap",
          marginBottom: DESIGN_TOKENS.spacing[1]
        }}
      >
        <strong
          style={{
            font: DESIGN_TOKENS.typography.h3,
            letterSpacing: 0,
            color: DESIGN_TOKENS.colors.brandPrimary,
            textShadow: "0 0 22px rgba(34,211,238,0.56)"
          }}
        >
          {hero.brand}
        </strong>
        <div
          style={{
            color: DESIGN_TOKENS.colors.textPrimary,
            textDecoration: "none",
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid rgba(34,211,238,0.22)",
            background: "rgba(17,24,39,0.72)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 28px rgba(34,211,238,0.12)"
          }}
        >
          <ReachSignupAndLoginQuicklyActions includePrimary />
        </div>
      </header>

      <section
        style={{
          display: "grid",
          gap: DESIGN_TOKENS.spacing[1],
          marginBottom: DESIGN_TOKENS.spacing[2],
          background: "linear-gradient(135deg, rgba(17,24,39,0.92), rgba(12,17,34,0.86))",
          border: "1px solid rgba(34,211,238,0.24)",
          borderRadius: 18,
          padding: `${DESIGN_TOKENS.spacing[2]}px ${DESIGN_TOKENS.spacing[2]}px`,
          boxShadow: "0 24px 80px rgba(0,0,0,0.36), 0 0 44px rgba(168,85,247,0.12)"
        }}
      >
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, margin: 0, maxWidth: 900 }}>{hero.headline}</h1>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary, maxWidth: 760, margin: 0 }}>{hero.valueProposition}</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: DESIGN_TOKENS.spacing[1] }}>
          <a
            href="/signup"
            style={{
              width: "fit-content",
              padding: "12px 20px",
              borderRadius: 999,
              background: `linear-gradient(120deg, ${DESIGN_TOKENS.colors.brandPrimary}, ${DESIGN_TOKENS.colors.brandSecondary})`,
              color: "#07111F",
              textDecoration: "none",
              fontWeight: 700,
              letterSpacing: 0,
              boxShadow: "0 0 28px rgba(34,211,238,0.36), 0 14px 28px rgba(0,0,0,0.28)"
            }}
          >
            {hero.primaryCta.label}
          </a>
          <a
            href="/login"
            style={{
              width: "fit-content",
              padding: "12px 20px",
              borderRadius: 999,
              background: "rgba(7,9,18,0.7)",
              color: DESIGN_TOKENS.colors.textPrimary,
              border: "1px solid rgba(167,179,200,0.22)",
              textDecoration: "none",
              fontWeight: 700,
              letterSpacing: 0
            }}
          >
            Login
          </a>
        </div>
      </section>

      <section
        aria-label="how-it-works"
        style={{
          marginBottom: DESIGN_TOKENS.spacing[2],
          background: "rgba(17,24,39,0.72)",
          border: "1px solid rgba(168,85,247,0.2)",
          borderRadius: 16,
          padding: `${DESIGN_TOKENS.spacing[1]}px ${DESIGN_TOKENS.spacing[2]}px`
        }}
      >
        <h2 style={{ font: DESIGN_TOKENS.typography.h2 }}>How it works</h2>
        <ol style={{ paddingLeft: 20, margin: 0, color: DESIGN_TOKENS.colors.textSecondary }}>
          {HOW_IT_WORKS_STEPS.map((step) => (
            <li key={step} style={{ marginBottom: 6 }}>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-label="sample digest preview"
        style={{
          marginBottom: DESIGN_TOKENS.spacing[2],
          background: "rgba(17,24,39,0.72)",
          border: "1px solid rgba(244,114,182,0.24)",
          borderRadius: 16,
          padding: `${DESIGN_TOKENS.spacing[1]}px ${DESIGN_TOKENS.spacing[2]}px`
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#0B1020",
            background: `linear-gradient(120deg, ${DESIGN_TOKENS.colors.accentHighlight}, ${DESIGN_TOKENS.colors.warning})`,
            borderRadius: 999,
            padding: "6px 12px",
            width: "fit-content",
            fontWeight: 700
          }}
        >
          {SAMPLE_DIGEST_PREVIEW.label}
        </p>
        <h3 style={{ font: DESIGN_TOKENS.typography.h3, margin: "8px 0" }}>{SAMPLE_DIGEST_PREVIEW.title}</h3>
        <p style={{ margin: 0, color: DESIGN_TOKENS.colors.textSecondary }}>{SAMPLE_DIGEST_PREVIEW.snippet}</p>
      </section>

      <footer
        style={{
          display: "flex",
          gap: DESIGN_TOKENS.spacing[1],
          flexWrap: "wrap",
          paddingTop: DESIGN_TOKENS.spacing[1],
          borderTop: "1px solid rgba(167,179,200,0.18)"
        }}
      >
        {FOOTER_TRUST_LINKS.map((link) => (
          <a key={link.id} href={link.route} style={{ color: DESIGN_TOKENS.colors.textSecondary, textDecoration: "none" }}>
            {link.label}
          </a>
        ))}
        <span style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
          Powered by{" "}
          <a href="https://www.netfroot.com/" style={{ color: DESIGN_TOKENS.colors.brandPrimary, fontWeight: 800 }}>
            Netfroot
          </a>
        </span>
      </footer>
    </main>
  );
}
