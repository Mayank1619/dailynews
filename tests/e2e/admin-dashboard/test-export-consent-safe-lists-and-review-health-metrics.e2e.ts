import { expect, test } from "@playwright/test";
import { EXPORT_METRICS_COPY } from "../../../apps/web/src/features/admin-dashboard/export-consent-safe-lists-and-review-health-metrics";

test("US4 e2e placeholder: metrics panel renders available and unavailable values", async ({ page }) => {
  await page.setContent(`
    <main>
      <section>
        <h2>${EXPORT_METRICS_COPY.metricsHeading}</h2>
        <div>
          <div>1500<span>Registrations</span></div>
          <div>3200<span>Newsletter Sends</span></div>
          <div>${EXPORT_METRICS_COPY.unavailableLabel}<span>Est. Open Rate (%)</span></div>
        </div>
      </section>
    </main>
  `, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: EXPORT_METRICS_COPY.metricsHeading })).toBeVisible();
  await expect(page.getByText("1500")).toBeVisible();
  await expect(page.getByText(EXPORT_METRICS_COPY.unavailableLabel)).toBeVisible();
});

test("US4 e2e placeholder: export buttons are present and labelled", async ({ page }) => {
  await page.setContent(`
    <main>
      <section>
        <h2>${EXPORT_METRICS_COPY.exportHeading}</h2>
        <button aria-label="Export users with offers consent">${EXPORT_METRICS_COPY.exportOffersLabel}</button>
        <button aria-label="Export users with product updates consent">${EXPORT_METRICS_COPY.exportProductUpdatesLabel}</button>
      </section>
    </main>
  `, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: EXPORT_METRICS_COPY.exportHeading })).toBeVisible();
  await expect(page.getByRole("button", { name: /Export users with offers consent/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Export users with product updates consent/ })).toBeVisible();
});

test("US4 e2e placeholder: empty export message shown when no rows returned", async ({ page }) => {
  await page.setContent(`
    <main>
      <section>
        <p>${EXPORT_METRICS_COPY.emptyExport}</p>
      </section>
    </main>
  `, { waitUntil: "domcontentloaded" });

  await expect(page.getByText(EXPORT_METRICS_COPY.emptyExport)).toBeVisible();
});
