import type { Page } from "@playwright/test";

type E2EPreferences = {
  topics: string[];
  frequency: "daily" | "weekdays" | "weekly";
  country: string;
  province: string;
  deliveryTime: string;
  timezone: string;
  newsletterEnabled: boolean;
};

const defaultPreferences: E2EPreferences = {
  topics: ["New in Technology", "Markets", "Science"],
  frequency: "daily",
  country: "Canada",
  province: "Ontario",
  deliveryTime: "08:00",
  timezone: "America/Toronto",
  newsletterEnabled: true
};

export async function enableE2EAuth(page: Page, preferences: Partial<E2EPreferences> = {}): Promise<void> {
  const seededPreferences = { ...defaultPreferences, ...preferences };

  await page.addInitScript((prefs) => {
    const preferenceKey = "daily-paper-demo-preferences:e2e-user";
    const billingKey = "daily-paper-demo-billing:e2e-user";

    window.localStorage.setItem("daily-paper-e2e-auth", "true");

    if (!window.localStorage.getItem(preferenceKey)) {
      window.localStorage.setItem(preferenceKey, JSON.stringify(prefs));
    }

    if (!window.localStorage.getItem(billingKey)) {
      window.localStorage.setItem(
        billingKey,
        JSON.stringify({
        status: "trialing",
        startedAt: "2026-06-02T08:00:00.000Z",
        trialEndsAt: "2026-06-17T08:00:00.000Z",
        selectedInterval: "monthly"
        })
      );
    }
  }, seededPreferences);
}
