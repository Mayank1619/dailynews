export type DashboardPreferenceSummary = {
  userId: string;
  topics: string[];
  region: string;
  deliveryTimeLocal: string;
  newsletterEnabled: boolean;
  updatedAt: string;
};

export type DashboardHistoryStatus = "sent" | "failed" | "skipped";

export type DashboardNewsletterHistoryItem = {
  newsletterId: string;
  userId: string;
  date: string;
  status: DashboardHistoryStatus;
  viewUrl?: string;
  sentAt?: string;
};

export type DashboardView = {
  preferenceSummary: DashboardPreferenceSummary | null;
  history: DashboardNewsletterHistoryItem[];
  nextCursor?: string;
};

export type DashboardPreferenceRepository = {
  getPreferenceSummaryByUid: (uid: string) => Promise<DashboardPreferenceSummary | null>;
  updateNewsletterEnabled: (uid: string, newsletterEnabled: boolean) => Promise<DashboardPreferenceSummary>;
};

export type DashboardHistoryRepository = {
  getHistoryByUid: (uid: string, options?: { limit?: number; cursor?: string }) => Promise<{
    items: DashboardNewsletterHistoryItem[];
    nextCursor?: string;
  }>;
};

export type DashboardQueryServiceDependencies = {
  preferenceRepository: DashboardPreferenceRepository;
  historyRepository: DashboardHistoryRepository;
};

export class DashboardQueryService {
  constructor(private readonly deps: DashboardQueryServiceDependencies) {}

  async getDashboardView(
    authenticatedUid: string,
    ownerUid: string,
    options?: { limit?: number; cursor?: string }
  ): Promise<DashboardView> {
    if (authenticatedUid !== ownerUid) {
      throw new Error("Forbidden: UID ownership mismatch");
    }

    const [preferenceSummary, historyResult] = await Promise.all([
      this.deps.preferenceRepository.getPreferenceSummaryByUid(ownerUid),
      this.deps.historyRepository.getHistoryByUid(ownerUid, options)
    ]);

    const history = historyResult.items
      .filter((item) => item.userId === ownerUid)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      preferenceSummary,
      history,
      nextCursor: historyResult.nextCursor
    };
  }

  async updateDeliveryState(
    authenticatedUid: string,
    ownerUid: string,
    newsletterEnabled: boolean
  ): Promise<DashboardPreferenceSummary> {
    if (authenticatedUid !== ownerUid) {
      throw new Error("Forbidden: UID ownership mismatch");
    }

    return this.deps.preferenceRepository.updateNewsletterEnabled(ownerUid, newsletterEnabled);
  }
}
