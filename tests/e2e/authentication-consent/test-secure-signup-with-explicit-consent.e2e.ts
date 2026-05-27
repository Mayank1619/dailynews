import { expect, test } from "@playwright/test";
import { AUTH_SIGNUP_COPY } from "../../../apps/web/src/features/authentication-consent/secure-signup-with-explicit-consent";

test("US1 e2e placeholder: signup presents explicit consent choices", async ({ page }) => {
  await page.setContent(`
    <main>
      <h1>${AUTH_SIGNUP_COPY.heading}</h1>
      <p>${AUTH_SIGNUP_COPY.subheading}</p>
      <label>${AUTH_SIGNUP_COPY.newsletterLabel}</label>
      <label>${AUTH_SIGNUP_COPY.productUpdatesLabel}</label>
      <label>${AUTH_SIGNUP_COPY.offersLabel}</label>
    </main>
  `, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: AUTH_SIGNUP_COPY.heading })).toBeVisible();
  await expect(page.getByText(AUTH_SIGNUP_COPY.newsletterLabel)).toBeVisible();
  await expect(page.getByText(AUTH_SIGNUP_COPY.productUpdatesLabel)).toBeVisible();
  await expect(page.getByText(AUTH_SIGNUP_COPY.offersLabel)).toBeVisible();
});
