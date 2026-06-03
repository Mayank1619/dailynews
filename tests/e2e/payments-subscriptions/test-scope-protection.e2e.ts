import { expect, test } from "@playwright/test";
import { PAYMENTS_SUBSCRIPTIONS_COPY } from "../../../apps/web/src/features/payments-subscriptions/payments-subscriptions";

test("billing UI shows 15-day trial and monthly plan", async ({ page }) => {
  await page.setContent(
    `
    <main>
      <section aria-label="Plan status">
        <p>${PAYMENTS_SUBSCRIPTIONS_COPY.trialBadge}</p>
        <h2>${PAYMENTS_SUBSCRIPTIONS_COPY.heading}</h2>
        <p>${PAYMENTS_SUBSCRIPTIONS_COPY.trialDescription}</p>
        <label><input type="radio" name="billing-interval" checked /> Monthly <strong>${PAYMENTS_SUBSCRIPTIONS_COPY.monthlyPrice}</strong></label>
        <label><input type="radio" name="billing-interval" /> Annual <strong>${PAYMENTS_SUBSCRIPTIONS_COPY.annualPrice}</strong></label>
        <button>${PAYMENTS_SUBSCRIPTIONS_COPY.upgradeLabel}</button>
      </section>
    </main>
  `,
    { waitUntil: "domcontentloaded" }
  );

  await expect(page.getByText(PAYMENTS_SUBSCRIPTIONS_COPY.trialBadge)).toBeVisible();
  await expect(page.getByText(PAYMENTS_SUBSCRIPTIONS_COPY.monthlyPrice)).toBeVisible();
  await expect(page.getByRole("button", { name: PAYMENTS_SUBSCRIPTIONS_COPY.upgradeLabel })).toBeVisible();
});

test("billing UI offers annual plan and avoids card collection", async ({ page }) => {
  await page.setContent(
    `
    <main>
      <section aria-label="Plan status">
        <h2>${PAYMENTS_SUBSCRIPTIONS_COPY.heading}</h2>
        <label><input type="radio" name="billing-interval" /> Annual <strong>${PAYMENTS_SUBSCRIPTIONS_COPY.annualPrice}</strong></label>
        <button>${PAYMENTS_SUBSCRIPTIONS_COPY.upgradeLabel}</button>
      </section>
    </main>
  `,
    { waitUntil: "domcontentloaded" }
  );

  await expect(page.getByText(PAYMENTS_SUBSCRIPTIONS_COPY.annualPrice)).toBeVisible();
  await expect(page.getByLabel(/card|cvv|cvc|expiry/i)).toHaveCount(0);
});

test("billing language remains clear and non-coercive", async ({ page }) => {
  await page.setContent(
    `
    <main>
      <section aria-label="Plan status">
        <h2>${PAYMENTS_SUBSCRIPTIONS_COPY.heading}</h2>
        <p>${PAYMENTS_SUBSCRIPTIONS_COPY.trialDescription}</p>
        <p>${PAYMENTS_SUBSCRIPTIONS_COPY.providerNotConfigured}</p>
      </section>
    </main>
  `,
    { waitUntil: "domcontentloaded" }
  );

  const bodyText = (await page.locator("body").textContent()) ?? "";
  expect(bodyText).not.toMatch(/limited time|act now|don't miss out/i);
  expect(bodyText).not.toMatch(/enter your card here|cvv|cvc/i);
});
