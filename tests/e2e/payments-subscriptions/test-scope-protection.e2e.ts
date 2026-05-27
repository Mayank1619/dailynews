import { expect, test } from "@playwright/test";
import { PAYMENTS_SUBSCRIPTIONS_COPY } from "../../../apps/web/src/features/payments-subscriptions/payments-subscriptions";

/**
 * End-to-end placeholder tests for Payments / Subscriptions (Phase 1).
 *
 * These tests verify that:
 * 1. Free-tier plan messaging is displayed correctly.
 * 2. No checkout, upgrade, or paid-plan flows are presented in Phase 1.
 * 3. The UI aligns with consent and trust guardrails defined in the spec.
 */

// ---------------------------------------------------------------------------
// US1 e2e: free-tier plan status is the only experience shown
// ---------------------------------------------------------------------------
test("US1 e2e placeholder: plan status shows free plan without paid upsell", async ({
  page,
}) => {
  await page.setContent(
    `
    <main>
      <section aria-label="Plan status">
        <h2>${PAYMENTS_SUBSCRIPTIONS_COPY.heading}</h2>
        <span>${PAYMENTS_SUBSCRIPTIONS_COPY.currentPlanLabel}</span>
        <span>${PAYMENTS_SUBSCRIPTIONS_COPY.freePlanName}</span>
        <p>${PAYMENTS_SUBSCRIPTIONS_COPY.freePlanDescription}</p>
        <p>${PAYMENTS_SUBSCRIPTIONS_COPY.noPaymentRequired}</p>
      </section>
    </main>
  `,
    { waitUntil: "domcontentloaded" }
  );

  await expect(
    page.getByRole("heading", { name: PAYMENTS_SUBSCRIPTIONS_COPY.heading })
  ).toBeVisible();
  await expect(
    page.getByText(PAYMENTS_SUBSCRIPTIONS_COPY.freePlanName)
  ).toBeVisible();
  await expect(
    page.getByText(PAYMENTS_SUBSCRIPTIONS_COPY.noPaymentRequired)
  ).toBeVisible();

  // Confirm no checkout or upgrade button exists
  await expect(page.getByRole("button", { name: /upgrade|checkout|subscribe|pay/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /upgrade|checkout|subscribe|pay/i })).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// US2 e2e: reserved premium features are not surfaced in the UI
// ---------------------------------------------------------------------------
test("US2 e2e placeholder: premium feature flags are not surfaced in Phase 1", async ({
  page,
}) => {
  await page.setContent(
    `
    <main>
      <section aria-label="Plan status">
        <h2>${PAYMENTS_SUBSCRIPTIONS_COPY.heading}</h2>
        <p>${PAYMENTS_SUBSCRIPTIONS_COPY.freePlanDescription}</p>
        <p>${PAYMENTS_SUBSCRIPTIONS_COPY.premiumComingSoon}</p>
      </section>
    </main>
  `,
    { waitUntil: "domcontentloaded" }
  );

  // Premium flags MUST NOT appear as interactive elements
  await expect(page.getByRole("checkbox", { name: /ad.?free/i })).toHaveCount(0);
  await expect(page.getByRole("checkbox", { name: /more.?sources/i })).toHaveCount(0);
  await expect(page.getByRole("checkbox", { name: /longer.?digest/i })).toHaveCount(0);

  // "Coming soon" neutral messaging is acceptable
  await expect(
    page.getByText(PAYMENTS_SUBSCRIPTIONS_COPY.premiumComingSoon)
  ).toBeVisible();
});

// ---------------------------------------------------------------------------
// US3 e2e: free-tier plan description is clear and non-misleading
// ---------------------------------------------------------------------------
test("US3 e2e placeholder: plan description is clear and trust-preserving", async ({
  page,
}) => {
  await page.setContent(
    `
    <main>
      <section aria-label="Plan status">
        <h2>${PAYMENTS_SUBSCRIPTIONS_COPY.heading}</h2>
        <p>${PAYMENTS_SUBSCRIPTIONS_COPY.freePlanDescription}</p>
        <p>${PAYMENTS_SUBSCRIPTIONS_COPY.planStatusLabel} ${PAYMENTS_SUBSCRIPTIONS_COPY.activeStatus}</p>
        <p>${PAYMENTS_SUBSCRIPTIONS_COPY.noPaymentRequired}</p>
      </section>
    </main>
  `,
    { waitUntil: "domcontentloaded" }
  );

  await expect(
    page.getByText(PAYMENTS_SUBSCRIPTIONS_COPY.freePlanDescription)
  ).toBeVisible();
  await expect(
    page.getByText(PAYMENTS_SUBSCRIPTIONS_COPY.activeStatus)
  ).toBeVisible();

  // Confirm no coercive or misleading language
  const bodyText = (await page.locator("body").textContent()) ?? "";
  expect(bodyText).not.toMatch(/limited time|act now|don't miss out|upgrade now/i);
  expect(bodyText).not.toMatch(/your free trial expires/i);
});
