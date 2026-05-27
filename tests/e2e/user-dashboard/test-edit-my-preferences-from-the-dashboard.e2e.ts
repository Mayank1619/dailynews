import { expect, test } from "@playwright/test";
import { EDIT_PREFERENCES_COPY } from "../../../apps/web/src/features/user-dashboard/edit-my-preferences-from-the-dashboard";

test("US2 e2e placeholder: edit preferences link is present", async ({ page }) => {
  await page.setContent(
    `<main><a href="/preferences/edit?source=dashboard">${EDIT_PREFERENCES_COPY.ctaLabel}</a></main>`,
    { waitUntil: "domcontentloaded" }
  );

  await expect(page.getByRole("link", { name: EDIT_PREFERENCES_COPY.ctaLabel })).toBeVisible();
});

test("US2 e2e placeholder: helper text renders", async ({ page }) => {
  await page.setContent(`<p>${EDIT_PREFERENCES_COPY.helperText}</p>`, { waitUntil: "domcontentloaded" });
  await expect(page.getByText(EDIT_PREFERENCES_COPY.helperText)).toBeVisible();
});
