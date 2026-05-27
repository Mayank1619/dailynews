export type BlogDiscoveryAuditEvent = {
  feature: "blog-seo";
  eventName: "blog-discovery-filtered";
  status: "success" | "warning" | "error";
  occurredAt: string;
  metadata: Record<string, string | number | boolean>;
};

function sanitizeMetadata(
  metadata: Record<string, unknown>
): Record<string, string | number | boolean> {
  const sanitized: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function createBlogDiscoveryAuditEvent(
  status: BlogDiscoveryAuditEvent["status"],
  metadata: Record<string, unknown>
): BlogDiscoveryAuditEvent {
  return {
    feature: "blog-seo",
    eventName: "blog-discovery-filtered",
    status,
    occurredAt: new Date().toISOString(),
    metadata: sanitizeMetadata(metadata)
  };
}
