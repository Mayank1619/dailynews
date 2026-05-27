import type { DashboardPreferenceSummary } from "./dashboardService";

export type EditMyPreferencesRequest = {
  authenticatedUid: string;
  ownerUid: string;
  source: string;
};

export type EditMyPreferencesResponse = {
  editorPath: string;
  summary: DashboardPreferenceSummary | null;
};
