export type UserDashboardTelemetryStatus = "success" | "error";

export type UserDashboardTelemetryEvent = {
  eventName:
    | "dashboard.viewed"
    | "dashboard.preferences_card_viewed"
    | "dashboard.history_list_viewed"
    | "preferences.edit_link_clicked"
    | "newsletter.paused"
    | "newsletter.resumed"
    | "account.logout_initiated"
    | "account.delete_initiated"
    | "account.delete_confirmed"
    | "dashboard.load_failed"
    | "dashboard.history_load_failed"
    | "dashboard.preferences_load_failed"
    | "dashboard.delivery_toggle_failed";
  status: UserDashboardTelemetryStatus;
  metadata: Record<string, string | number | boolean>;
  timestamp: string;
};

export type UserDashboardTelemetry = {
  track: (event: UserDashboardTelemetryEvent) => Promise<void>;
};

export function createUserDashboardTelemetryEvent(
  eventName: UserDashboardTelemetryEvent["eventName"],
  status: UserDashboardTelemetryStatus,
  metadata: Record<string, string | number | boolean> = {},
  now: () => Date = () => new Date()
): UserDashboardTelemetryEvent {
  return {
    eventName,
    status,
    metadata,
    timestamp: now().toISOString()
  };
}

export function createUserDashboardTelemetry(
  sink: (event: UserDashboardTelemetryEvent) => void | Promise<void> = (event) =>
    console.info(JSON.stringify(event))
): UserDashboardTelemetry {
  return {
    async track(event: UserDashboardTelemetryEvent): Promise<void> {
      await sink(event);
    }
  };
}
