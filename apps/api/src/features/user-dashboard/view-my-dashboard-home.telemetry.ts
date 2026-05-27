import {
  createUserDashboardTelemetryEvent,
  type UserDashboardTelemetryEvent
} from "./telemetry";

export type ViewMyDashboardHomeTelemetryEventName =
  | "dashboard.viewed"
  | "dashboard.preferences_card_viewed"
  | "dashboard.history_list_viewed"
  | "dashboard.load_failed"
  | "dashboard.history_load_failed"
  | "dashboard.preferences_load_failed";

export function createViewMyDashboardHomeTelemetryEvent(
  eventName: ViewMyDashboardHomeTelemetryEventName,
  status: UserDashboardTelemetryEvent["status"],
  metadata: Record<string, string | number | boolean>
): UserDashboardTelemetryEvent {
  return createUserDashboardTelemetryEvent(eventName, status, metadata);
}
