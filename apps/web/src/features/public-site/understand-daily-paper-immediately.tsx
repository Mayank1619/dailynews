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
        padding: DESIGN_TOKENS.spacing[2],
        font: DESIGN_TOKENS.typography.body,
        color: DESIGN_TOKENS.colors.textPrimary,
        background:
          "radial-gradient(circle at 10% 0%, rgba(59,130,246,0.08), transparent 40%), radial-gradient(circle at 100% 0%, rgba(34,197,94,0.08), transparent 35%), #F8FAFC"
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
          gap: DESIGN_TOKENS.spacing[1],
          flexWrap: "wrap",
          marginBottom: DESIGN_TOKENS.spacing[2]
        }}
      >
        <strong style={{ font: DESIGN_TOKENS.typography.h3 }}>{hero.brand}</strong>
        <div
          style={{
            color: DESIGN_TOKENS.colors.textPrimary,
            textDecoration: "none",
            padding: "8px 12px",
            borderRadius: 999,
            border: `1px solid ${DESIGN_TOKENS.colors.brandPrimary}`
          }}
        >
          <ReachSignupAndLoginQuicklyActions />
        </div>
      </header>

      <section style={{ display: "grid", gap: DESIGN_TOKENS.spacing[1], marginBottom: DESIGN_TOKENS.spacing[2] }}>
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, margin: 0 }}>{hero.brand}</h1>
        <p style={{ font: DESIGN_TOKENS.typography.h2, margin: 0 }}>{hero.headline}</p>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary, maxWidth: 720, margin: 0 }}>{hero.valueProposition}</p>
        <a
          href={hero.primaryCta.route}
          style={{
            width: "fit-content",
            marginTop: DESIGN_TOKENS.spacing[1],
            padding: "10px 18px",
            borderRadius: 999,
            background: DESIGN_TOKENS.colors.brandPrimary,
            color: DESIGN_TOKENS.colors.bgSecondary,
            textDecoration: "none",
            fontWeight: 700,
            boxShadow: "0 6px 20px rgba(59,130,246,0.25)"
          }}
        >
          {hero.primaryCta.label}
        </a>
      </section>

      <section aria-label="how-it-works" style={{ marginBottom: DESIGN_TOKENS.spacing[2] }}>
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
          border: `1px solid rgba(15,23,42,0.08)`,
          borderRadius: 16,
          padding: DESIGN_TOKENS.spacing[1]
        }}
      >
        <p style={{ margin: 0, color: DESIGN_TOKENS.colors.brandSecondary, fontWeight: 700 }}>{SAMPLE_DIGEST_PREVIEW.label}</p>
        <h3 style={{ font: DESIGN_TOKENS.typography.h3, margin: "8px 0" }}>{SAMPLE_DIGEST_PREVIEW.title}</h3>
        <p style={{ margin: 0, color: DESIGN_TOKENS.colors.textSecondary }}>{SAMPLE_DIGEST_PREVIEW.snippet}</p>
      </section>

      <footer style={{ display: "flex", gap: DESIGN_TOKENS.spacing[1], flexWrap: "wrap" }}>
        {FOOTER_TRUST_LINKS.map((link) => (
          <a key={link.id} href={link.route} style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
            {link.label}
          </a>
        ))}
      </footer>
    </main>
  );
}
