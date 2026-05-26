export type PublicSiteAuditEvent = {
  feature: "public-site";
  eventName: string;
  status: "success" | "warning" | "error";
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

export function createPublicSiteAuditEvent(
  eventName: string,
  status: PublicSiteAuditEvent["status"],
  metadata: Record<string, unknown>
): PublicSiteAuditEvent {
  return {
    feature: "public-site",
    eventName,
    status,
    occurredAt: new Date().toISOString(),
    metadata: sanitizeMetadata(metadata)
  };
}
