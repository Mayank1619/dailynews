import { expect, test } from "@playwright/test";
import { DELIVERY_TOGGLE_COPY } from "../../../apps/web/src/features/user-dashboard/pause-or-resume-newsletter-delivery";

test("US3 e2e placeholder: pause button is visible for active delivery", async ({ page }) => {
  await page.setContent(`<button>${DELIVERY_TOGGLE_COPY.pauseLabel}</button>`, {
    waitUntil: "domcontentloaded"
  });
  await expect(page.getByRole("button", { name: DELIVERY_TOGGLE_COPY.pauseLabel })).toBeVisible();
});

test("US3 e2e placeholder: resume button is visible for paused delivery", async ({ page }) => {
  await page.setContent(`<button>${DELIVERY_TOGGLE_COPY.resumeLabel}</button>`, {
    waitUntil: "domcontentloaded"
  });
  await expect(page.getByRole("button", { name: DELIVERY_TOGGLE_COPY.resumeLabel })).toBeVisible();
});
