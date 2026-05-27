import type { DashboardPreferenceSummary } from "./dashboardService";

export type ToggleNewsletterDeliveryRequest = {
  authenticatedUid: string;
  ownerUid: string;
  source: string;
  pause: boolean;
};

export type ToggleNewsletterDeliveryResponse = {
  summary: DashboardPreferenceSummary;
  state: "active" | "paused";
};
