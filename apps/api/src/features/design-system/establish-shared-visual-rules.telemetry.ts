type EventStatus = "success" | "warning" | "error";

export type DesignSystemAuditEvent = {
  feature: "design-system";
  eventName: string;
  status: EventStatus;
  occurredAt: string;
  metadata: Record<string, string | number | boolean>;
};

function sanitizeMetadata(metadata: Record<string, unknown>): Record<string, string | number | boolean> {
  const sanitized: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function createDesignSystemAuditEvent(
  eventName: string,
  status: EventStatus,
  metadata: Record<string, unknown>
): DesignSystemAuditEvent {
  return {
    feature: "design-system",
    eventName,
    status,
    occurredAt: new Date().toISOString(),
    metadata: sanitizeMetadata(metadata)
  };
}
