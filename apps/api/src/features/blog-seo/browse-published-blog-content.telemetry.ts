export type BlogBrowseAuditEvent = {
  feature: "blog-seo";
  eventName: "blog-index-browsed";
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

export function createBlogBrowseAuditEvent(
  status: BlogBrowseAuditEvent["status"],
  metadata: Record<string, unknown>
): BlogBrowseAuditEvent {
  return {
    feature: "blog-seo",
    eventName: "blog-index-browsed",
    status,
    occurredAt: new Date().toISOString(),
    metadata: sanitizeMetadata(metadata)
  };
}
