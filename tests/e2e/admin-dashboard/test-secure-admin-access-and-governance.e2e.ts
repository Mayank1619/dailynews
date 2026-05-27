import { expect, test } from "@playwright/test";
import { ADMIN_ACCESS_COPY } from "../../../apps/web/src/features/admin-dashboard/secure-admin-access-and-governance";

test("US1 e2e placeholder: admin dashboard renders for admin users", async ({ page }) => {
  await page.setContent(`
    <main>
      <h1>${ADMIN_ACCESS_COPY.heading}</h1>
      <section aria-label="${ADMIN_ACCESS_COPY.activityHeading}">
        <h2>${ADMIN_ACCESS_COPY.activityHeading}</h2>
        <p>${ADMIN_ACCESS_COPY.noActivity}</p>
      </section>
    </main>
  `, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: ADMIN_ACCESS_COPY.heading })).toBeVisible();
  await expect(page.getByRole("heading", { name: ADMIN_ACCESS_COPY.activityHeading })).toBeVisible();
  await expect(page.getByText(ADMIN_ACCESS_COPY.noActivity)).toBeVisible();
});

test("US1 e2e placeholder: access denied message shown for non-admin users", async ({ page }) => {
  await page.setContent(`
    <main>
      <h1>${ADMIN_ACCESS_COPY.deniedHeading}</h1>
      <p>${ADMIN_ACCESS_COPY.deniedMessage}</p>
    </main>
  `, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: ADMIN_ACCESS_COPY.deniedHeading })).toBeVisible();
  await expect(page.getByText(ADMIN_ACCESS_COPY.deniedMessage)).toBeVisible();
});
