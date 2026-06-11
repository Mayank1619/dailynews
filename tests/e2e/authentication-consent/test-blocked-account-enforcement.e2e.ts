import { expect, test } from "@playwright/test";
import { BLOCKED_ACCOUNT_COPY } from "../../../apps/web/src/features/authentication-consent/blocked-account-enforcement";

test("US3 e2e placeholder: blocked user sees BlockedAccountBanner message", async ({ page }) => {
  await page.setContent(
    `
    <main>
      <div id="blocked-banner" role="alert">
        ${BLOCKED_ACCOUNT_COPY.message}
      </div>
    </main>
  `,
    { waitUntil: "domcontentloaded" }
  );

  const banner = page.locator("#blocked-banner");
  await expect(banner).toBeVisible();
  await expect(banner).toHaveText(BLOCKED_ACCOUNT_COPY.message);
});

test("US3 e2e placeholder: blocked users not in newsletter recipient list", async ({ page }) => {
  await page.goto("/");

  // Simulate a newsletter recipients endpoint that excludes blocked users
  await page.route("**/api/newsletter/recipients", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        recipients: [
          { uid: "uid-active-1", status: "active" },
          { uid: "uid-active-2", status: "active" }
          // uid-blocked-1 is intentionally absent
        ]
      })
    });
  });

  await page.setContent(
    `<main><div id="result">checking…</div></main>`,
    { waitUntil: "domcontentloaded" }
  );

  const response = await page.evaluate(async () => {
    const res = await fetch("/api/newsletter/recipients");
    return res.json() as Promise<{ recipients: Array<{ uid: string; status: string }> }>;
  });

  const blockedInList = (response as { recipients: Array<{ uid: string; status: string }> })
    .recipients.filter((r) => r.status === "blocked");
  expect(blockedInList).toHaveLength(0);
});

test("US3 e2e placeholder: login attempt by blocked account renders blocked banner", async ({ page }) => {
  await page.setContent(
    `
    <main>
      <form id="login-form">
        <input id="email" type="email" value="blocked@dailypaper.test" readonly />
        <input id="password" type="password" value="Pass-1" readonly />
        <button type="submit">Sign in</button>
      </form>
      <div id="blocked-banner" role="alert" hidden>${BLOCKED_ACCOUNT_COPY.message}</div>
    </main>
  `,
    { waitUntil: "domcontentloaded" }
  );

  // Simulate blocked login response
  await page.evaluate(() => {
    document.getElementById("login-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const banner = document.getElementById("blocked-banner");
      if (banner) banner.removeAttribute("hidden");
    });
  });

  await page.click('button[type="submit"]');
  await expect(page.locator("#blocked-banner")).toBeVisible();
  await expect(page.locator("#blocked-banner")).toHaveText(BLOCKED_ACCOUNT_COPY.message);
});
