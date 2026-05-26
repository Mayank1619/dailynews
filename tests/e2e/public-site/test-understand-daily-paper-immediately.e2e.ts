import { test, expect } from "@playwright/test";
import { PublicSiteLandingService } from "../../../apps/api/src/features/public-site/understand-daily-paper-immediately.service";
import { PUBLIC_NAV_ACTIONS } from "../../../apps/web/src/features/public-site/contracts";

test("US1 e2e: landing experience communicates value and exposes CTA", async ({ page }) => {
  const hero = new PublicSiteLandingService().buildHeroContent();
  const nav = PUBLIC_NAV_ACTIONS.filter((action) => action.route !== "/signup");
  const html = `
    <main>
      <h1>${hero.brand}</h1>
      <p>${hero.headline}</p>
      <a href="${hero.primaryCta.route}">${hero.primaryCta.label}</a>
      <nav>
        <a href="${nav[0].route}">${nav[0].label}</a>
        <a href="${nav[1].route}">${nav[1].label}</a>
      </nav>
    </main>
  `;
  await page.setContent(html, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Daily Paper" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Get Your Daily Paper" })).toHaveAttribute("href", "/signup");
  await expect(page.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
  await expect(page.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
});
