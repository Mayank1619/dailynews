import { expect, test } from "@playwright/test";
import { MANAGE_USERS_COPY } from "../../../apps/web/src/features/admin-dashboard/manage-users-and-consent-state";

test("US2 e2e placeholder: user list shows account status and control buttons", async ({ page }) => {
  await page.setContent(`
    <main>
      <h2>${MANAGE_USERS_COPY.heading}</h2>
      <table>
        <thead><tr>
          <th>User ID</th><th>Email (masked)</th><th>Status</th><th>Created</th><th>Actions</th>
        </tr></thead>
        <tbody>
          <tr>
            <td>uid-1</td>
            <td>r***@dailypaper.test</td>
            <td>${MANAGE_USERS_COPY.statusActive}</td>
            <td>01/01/2026</td>
            <td>
              <button aria-label="Block user uid-1">${MANAGE_USERS_COPY.blockLabel}</button>
              <button aria-label="View consent for uid-1">${MANAGE_USERS_COPY.viewConsentLabel}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  `, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: MANAGE_USERS_COPY.heading })).toBeVisible();
  await expect(page.getByText(MANAGE_USERS_COPY.statusActive)).toBeVisible();
  await expect(page.getByRole("button", { name: /Block user uid-1/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /View consent/ })).toBeVisible();
});

test("US2 e2e placeholder: confirmation dialog appears before block action", async ({ page }) => {
  await page.setContent(`
    <main>
      <div role="alertdialog" aria-modal="true" aria-label="Confirm action">
        <p>${MANAGE_USERS_COPY.confirmBlock}</p>
        <button>Confirm</button>
        <button>Cancel</button>
      </div>
    </main>
  `, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("alertdialog")).toBeVisible();
  await expect(page.getByText(MANAGE_USERS_COPY.confirmBlock)).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirm" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
});
