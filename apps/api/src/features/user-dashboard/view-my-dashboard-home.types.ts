import type {
  DashboardNewsletterHistoryItem,
  DashboardPreferenceSummary
} from "./dashboardService";

export type ViewMyDashboardHomeRequest = {
  authenticatedUid: string;
  ownerUid: string;
  historyLimit?: number;
  cursor?: string;
};

export type ViewMyDashboardHomeResponse = {
  preferenceSummary: DashboardPreferenceSummary | null;
  history: DashboardNewsletterHistoryItem[];
  nextCursor?: string;
  emptyHistory: boolean;
};
