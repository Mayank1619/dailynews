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
          "radial-gradient(circle at 5% 0%, rgba(14,165,233,0.16), transparent 42%), radial-gradient(circle at 95% 0%, rgba(20,184,166,0.14), transparent 36%), linear-gradient(180deg, #F5F7FB 0%, #FFFFFF 100%)"
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
            letterSpacing: "0.02em"
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
            border: "1px solid rgba(17,24,39,0.12)",
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(6px)"
          }}
        >
          <ReachSignupAndLoginQuicklyActions />
        </div>
      </header>

      <section
        style={{
          display: "grid",
          gap: DESIGN_TOKENS.spacing[1],
          marginBottom: DESIGN_TOKENS.spacing[2],
          background: "rgba(255,255,255,0.74)",
          border: "1px solid rgba(17,24,39,0.08)",
          borderRadius: 24,
          padding: `${DESIGN_TOKENS.spacing[2]}px ${DESIGN_TOKENS.spacing[2]}px`
        }}
      >
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, margin: 0, maxWidth: 900 }}>{hero.headline}</h1>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary, maxWidth: 760, margin: 0 }}>{hero.valueProposition}</p>
        <a
          href={hero.primaryCta.route}
          style={{
            width: "fit-content",
            marginTop: DESIGN_TOKENS.spacing[1],
            padding: "12px 20px",
            borderRadius: 999,
            background: `linear-gradient(120deg, ${DESIGN_TOKENS.colors.brandPrimary}, ${DESIGN_TOKENS.colors.brandSecondary})`,
            color: DESIGN_TOKENS.colors.bgSecondary,
            textDecoration: "none",
            fontWeight: 700,
            letterSpacing: "0.01em",
            boxShadow: "0 14px 26px rgba(14,165,233,0.28)"
          }}
        >
          {hero.primaryCta.label}
        </a>
      </section>

      <section
        aria-label="how-it-works"
        style={{
          marginBottom: DESIGN_TOKENS.spacing[2],
          background: DESIGN_TOKENS.colors.bgSecondary,
          border: "1px solid rgba(17,24,39,0.08)",
          borderRadius: 20,
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
          background: DESIGN_TOKENS.colors.bgSecondary,
          border: "1px solid rgba(17,24,39,0.08)",
          borderRadius: 20,
          padding: `${DESIGN_TOKENS.spacing[1]}px ${DESIGN_TOKENS.spacing[2]}px`
        }}
      >
        <p
          style={{
            margin: 0,
            color: DESIGN_TOKENS.colors.bgSecondary,
            background: DESIGN_TOKENS.colors.accentHighlight,
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
          borderTop: "1px solid rgba(17,24,39,0.1)"
        }}
      >
        {FOOTER_TRUST_LINKS.map((link) => (
          <a key={link.id} href={link.route} style={{ color: DESIGN_TOKENS.colors.textSecondary, textDecoration: "none" }}>
            {link.label}
          </a>
        ))}
      </footer>
    </main>
  );
}
