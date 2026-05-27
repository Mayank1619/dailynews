export type AdminDashboardTelemetryEvent = {
  feature: "admin-dashboard";
  eventName: string;
  status: "success" | "error" | "denied";
  occurredAt: string;
  metadata: Record<string, string | number | boolean>;
};

export type AdminDashboardTelemetry = {
  track: (event: AdminDashboardTelemetryEvent) => void | Promise<void>;
};

export function createAdminDashboardTelemetryEvent(
  eventName: string,
  status: AdminDashboardTelemetryEvent["status"],
  metadata: Record<string, unknown> = {}
): AdminDashboardTelemetryEvent {
  const sanitized: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      sanitized[key] = value;
    }
  }
  return {
    feature: "admin-dashboard",
    eventName,
    status,
    occurredAt: new Date().toISOString(),
    metadata: sanitized
  };
}
