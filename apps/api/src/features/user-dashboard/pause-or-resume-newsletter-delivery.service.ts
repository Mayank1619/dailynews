import type { DashboardQueryService } from "./dashboardService";
import {
  createPauseResumeTelemetryEvent,
  type PauseResumeTelemetryEventName
} from "./pause-or-resume-newsletter-delivery.telemetry";
import type { UserDashboardTelemetry } from "./telemetry";
import type {
  ToggleNewsletterDeliveryRequest,
  ToggleNewsletterDeliveryResponse
} from "./pause-or-resume-newsletter-delivery.types";

export type PauseResumeDeliveryDependencies = {
  dashboardQueryService: Pick<DashboardQueryService, "updateDeliveryState">;
  telemetry: UserDashboardTelemetry;
};

export class PauseOrResumeNewsletterDeliveryService {
  constructor(private readonly deps: PauseResumeDeliveryDependencies) {}

  async toggleDeliveryState(
    request: ToggleNewsletterDeliveryRequest
  ): Promise<ToggleNewsletterDeliveryResponse> {
    const newsletterEnabled = !request.pause;

    try {
      const summary = await this.deps.dashboardQueryService.updateDeliveryState(
        request.authenticatedUid,
        request.ownerUid,
        newsletterEnabled
      );

      await this.track(newsletterEnabled ? "newsletter.resumed" : "newsletter.paused", {
        userRef: request.authenticatedUid,
        source: request.source
      });

      return {
        summary,
        state: summary.newsletterEnabled ? "active" : "paused"
      };
    } catch (error) {
      await this.track("dashboard.delivery_toggle_failed", {
        userRef: request.authenticatedUid,
        code: error instanceof Error ? error.message : "unknown"
      });
      throw error;
    }
  }

  private async track(
    eventName: PauseResumeTelemetryEventName,
    metadata: Record<string, string | number | boolean>
  ): Promise<void> {
    await this.deps.telemetry.track(createPauseResumeTelemetryEvent(eventName, "success", metadata));
  }
}
