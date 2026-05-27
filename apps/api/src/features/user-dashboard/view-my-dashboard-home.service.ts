import { DashboardQueryService } from "./dashboardService";
import {
  createViewMyDashboardHomeTelemetryEvent,
  type ViewMyDashboardHomeTelemetryEventName
} from "./view-my-dashboard-home.telemetry";
import type { UserDashboardTelemetry } from "./telemetry";
import type {
  ViewMyDashboardHomeRequest,
  ViewMyDashboardHomeResponse
} from "./view-my-dashboard-home.types";

export type ViewMyDashboardHomeDependencies = {
  dashboardQueryService: DashboardQueryService;
  telemetry: UserDashboardTelemetry;
};

export class ViewMyDashboardHomeService {
  constructor(private readonly deps: ViewMyDashboardHomeDependencies) {}

  async getDashboardHome(request: ViewMyDashboardHomeRequest): Promise<ViewMyDashboardHomeResponse> {
    try {
      const view = await this.deps.dashboardQueryService.getDashboardView(
        request.authenticatedUid,
        request.ownerUid,
        { limit: request.historyLimit, cursor: request.cursor }
      );

      await this.track("dashboard.viewed", {
        userRef: request.authenticatedUid,
        hasPreferences: Boolean(view.preferenceSummary),
        historyCount: view.history.length
      });
      await this.track("dashboard.preferences_card_viewed", {
        userRef: request.authenticatedUid,
        newsletterEnabled: view.preferenceSummary?.newsletterEnabled ?? false
      });
      await this.track("dashboard.history_list_viewed", {
        userRef: request.authenticatedUid,
        historyCount: view.history.length
      });

      return {
        preferenceSummary: view.preferenceSummary,
        history: view.history,
        nextCursor: view.nextCursor,
        emptyHistory: view.history.length === 0
      };
    } catch (error) {
      await this.track("dashboard.load_failed", {
        userRef: request.authenticatedUid,
        code: error instanceof Error ? error.message : "unknown"
      });
      throw error;
    }
  }

  private async track(
    eventName: ViewMyDashboardHomeTelemetryEventName,
    metadata: Record<string, string | number | boolean>
  ): Promise<void> {
    await this.deps.telemetry.track(createViewMyDashboardHomeTelemetryEvent(eventName, "success", metadata));
  }
}
