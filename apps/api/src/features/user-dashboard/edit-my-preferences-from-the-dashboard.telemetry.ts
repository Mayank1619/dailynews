import {
  createUserDashboardTelemetryEvent,
  type UserDashboardTelemetry,
  type UserDashboardTelemetryEvent
} from "./telemetry";

export type EditPreferencesTelemetryEventName =
  | "preferences.edit_link_clicked"
  | "dashboard.preferences_load_failed";

export function createEditPreferencesTelemetryEvent(
  eventName: EditPreferencesTelemetryEventName,
  status: UserDashboardTelemetryEvent["status"],
  metadata: Record<string, string | number | boolean>
): UserDashboardTelemetryEvent {
  return createUserDashboardTelemetryEvent(eventName, status, metadata);
}

export function createEditPreferencesTelemetry(
  sink: (event: UserDashboardTelemetryEvent) => void | Promise<void> = (event) =>
    console.info(JSON.stringify(event))
): UserDashboardTelemetry {
  return {
    async track(event: UserDashboardTelemetryEvent): Promise<void> {
      await sink(event);
    }
  };
}
