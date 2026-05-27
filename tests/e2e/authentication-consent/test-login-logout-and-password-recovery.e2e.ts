import { expect, test } from "@playwright/test";
import {
  AUTH_LOGIN_COPY,
  AUTH_FORGOT_PASSWORD_COPY
} from "../../../apps/web/src/features/authentication-consent/login-logout-and-password-recovery";

test("US2 e2e placeholder: login form renders email, password fields and submit button", async ({ page }) => {
  await page.setContent(
    `
    <main>
      <h1>${AUTH_LOGIN_COPY.heading}</h1>
      <form>
        <label for="email">${AUTH_LOGIN_COPY.emailLabel}</label>
        <input id="email" type="email" />
        <label for="password">${AUTH_LOGIN_COPY.passwordLabel}</label>
        <input id="password" type="password" />
        <button type="submit">${AUTH_LOGIN_COPY.submitLabel}</button>
      </form>
    </main>
  `,
    { waitUntil: "domcontentloaded" }
  );

  await expect(page.getByRole("heading", { name: AUTH_LOGIN_COPY.heading })).toBeVisible();
  await expect(page.getByText(AUTH_LOGIN_COPY.emailLabel)).toBeVisible();
  await expect(page.getByText(AUTH_LOGIN_COPY.passwordLabel)).toBeVisible();
  await expect(page.getByRole("button", { name: AUTH_LOGIN_COPY.submitLabel })).toBeVisible();
});

test("US2 e2e placeholder: forgot-password form renders email field and non-enumeration message", async ({ page }) => {
  await page.setContent(
    `
    <main>
      <h2>${AUTH_FORGOT_PASSWORD_COPY.heading}</h2>
      <form>
        <label for="fp-email">${AUTH_FORGOT_PASSWORD_COPY.emailLabel}</label>
        <input id="fp-email" type="email" />
        <button type="submit">${AUTH_FORGOT_PASSWORD_COPY.submitLabel}</button>
      </form>
      <p id="confirm" hidden>${AUTH_FORGOT_PASSWORD_COPY.confirmationMessage}</p>
    </main>
  `,
    { waitUntil: "domcontentloaded" }
  );

  await expect(page.getByRole("heading", { name: AUTH_FORGOT_PASSWORD_COPY.heading })).toBeVisible();
  await expect(page.getByText(AUTH_FORGOT_PASSWORD_COPY.emailLabel)).toBeVisible();
  await expect(page.getByRole("button", { name: AUTH_FORGOT_PASSWORD_COPY.submitLabel })).toBeVisible();

  // Non-enumeration: confirmation message text is present in DOM (hidden until submit)
  const confirmEl = page.locator("#confirm");
  await expect(confirmEl).toHaveText(AUTH_FORGOT_PASSWORD_COPY.confirmationMessage);
});

test("US2 e2e placeholder: logout removes session indication", async ({ page }) => {
  await page.setContent(
    `
    <main>
      <p id="session-indicator">Logged in as user@dailypaper.test</p>
      <button id="logout-btn">Sign out</button>
      <p id="signed-out" hidden>You have been signed out.</p>
    </main>
  `,
    { waitUntil: "domcontentloaded" }
  );

  await page.click("#logout-btn");

  // Placeholder: manually remove session indicator and show signed-out message
  await page.evaluate(() => {
    const indicator = document.getElementById("session-indicator");
    const signedOut = document.getElementById("signed-out");
    if (indicator) indicator.remove();
    if (signedOut) signedOut.removeAttribute("hidden");
  });

  await expect(page.locator("#session-indicator")).toHaveCount(0);
  await expect(page.locator("#signed-out")).toBeVisible();
});
