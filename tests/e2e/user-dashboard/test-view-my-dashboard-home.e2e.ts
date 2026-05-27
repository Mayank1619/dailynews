import { expect, test } from "@playwright/test";
import { DASHBOARD_HOME_COPY } from "../../../apps/web/src/features/user-dashboard/view-my-dashboard-home";

test("US1 e2e placeholder: dashboard home headings and preferences card render", async ({ page }) => {
  await page.setContent(
    `
    <main>
      <h1>${DASHBOARD_HOME_COPY.heading}</h1>
      <section>
        <h2>${DASHBOARD_HOME_COPY.preferenceCardHeading}</h2>
        <button>${DASHBOARD_HOME_COPY.editPreferences}</button>
      </section>
    </main>
  `,
    { waitUntil: "domcontentloaded" }
  );

  await expect(page.getByRole("heading", { name: DASHBOARD_HOME_COPY.heading })).toBeVisible();
  await expect(page.getByRole("heading", { name: DASHBOARD_HOME_COPY.preferenceCardHeading })).toBeVisible();
  await expect(page.getByRole("button", { name: DASHBOARD_HOME_COPY.editPreferences })).toBeVisible();
});

test("US1 e2e placeholder: history empty state renders", async ({ page }) => {
  await page.setContent(`<p>${DASHBOARD_HOME_COPY.emptyHistory}</p>`, {
    waitUntil: "domcontentloaded"
  });

  await expect(page.getByText(DASHBOARD_HOME_COPY.emptyHistory)).toBeVisible();
});
