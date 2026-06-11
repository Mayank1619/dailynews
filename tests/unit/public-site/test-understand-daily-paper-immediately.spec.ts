import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import React from "react";
import { PublicSiteLandingService } from "../../../apps/api/src/features/public-site/understand-daily-paper-immediately.service";
import { UnderstandDailyPaperImmediatelyPage } from "../../../apps/web/src/features/public-site/understand-daily-paper-immediately";

describe("US1 unit: understand Daily Paper immediately", () => {
  it("builds concise hero copy with a dominant signup CTA", () => {
    const service = new PublicSiteLandingService();
    const hero = service.buildHeroContent();

    expect(hero.brand).toBe("Daily Paper");
    expect(hero.primaryCta.label).toBe("Get Your Daily Paper");
    expect(hero.primaryCta.route).toBe("/signup");
    expect(hero.valueProposition.length).toBeGreaterThan(40);
  });

  it("renders branding, value proposition, and CTA above supporting sections", () => {
    const html = renderToStaticMarkup(React.createElement(UnderstandDailyPaperImmediatelyPage));

    expect(html).toContain("Daily Paper");
    expect(html).toContain("Get Your Daily Paper");
    expect(html.indexOf("Get Your Daily Paper")).toBeLessThan(html.indexOf("How it works"));
    expect(html).toContain('href="/signup"');
    expect(html).toContain('href="/login"');
    expect(html).not.toContain('href="/blog"');
  });
});
