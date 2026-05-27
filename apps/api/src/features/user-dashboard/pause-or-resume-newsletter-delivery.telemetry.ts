import {
  createUserDashboardTelemetryEvent,
  type UserDashboardTelemetryEvent
} from "./telemetry";

export type PauseResumeTelemetryEventName =
  | "newsletter.paused"
  | "newsletter.resumed"
  | "dashboard.delivery_toggle_failed";

export function createPauseResumeTelemetryEvent(
  eventName: PauseResumeTelemetryEventName,
  status: UserDashboardTelemetryEvent["status"],
  metadata: Record<string, string | number | boolean>
): UserDashboardTelemetryEvent {
  return createUserDashboardTelemetryEvent(eventName, status, metadata);
}
