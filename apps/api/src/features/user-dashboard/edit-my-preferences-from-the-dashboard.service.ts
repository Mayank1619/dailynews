import type { DashboardPreferenceRepository } from "./dashboardService";
import {
  createEditPreferencesTelemetryEvent,
  type EditPreferencesTelemetryEventName
} from "./edit-my-preferences-from-the-dashboard.telemetry";
import type { UserDashboardTelemetry } from "./telemetry";
import type {
  EditMyPreferencesRequest,
  EditMyPreferencesResponse
} from "./edit-my-preferences-from-the-dashboard.types";

export type EditMyPreferencesDependencies = {
  preferenceRepository: Pick<DashboardPreferenceRepository, "getPreferenceSummaryByUid">;
  telemetry: UserDashboardTelemetry;
  preferencesEditorPath: string;
};

export class EditMyPreferencesFromDashboardService {
  constructor(private readonly deps: EditMyPreferencesDependencies) {}

  async getEditorRedirect(request: EditMyPreferencesRequest): Promise<EditMyPreferencesResponse> {
    if (request.authenticatedUid !== request.ownerUid) {
      throw new Error("Forbidden: UID ownership mismatch");
    }

    try {
      const summary = await this.deps.preferenceRepository.getPreferenceSummaryByUid(request.ownerUid);
      await this.track("preferences.edit_link_clicked", {
        userRef: request.authenticatedUid,
        source: request.source
      });

      return {
        editorPath: this.deps.preferencesEditorPath,
        summary
      };
    } catch (error) {
      await this.track("dashboard.preferences_load_failed", {
        userRef: request.authenticatedUid,
        code: error instanceof Error ? error.message : "unknown"
      });
      throw error;
    }
  }

  private async track(
    eventName: EditPreferencesTelemetryEventName,
    metadata: Record<string, string | number | boolean>
  ): Promise<void> {
    await this.deps.telemetry.track(createEditPreferencesTelemetryEvent(eventName, "success", metadata));
  }
}
