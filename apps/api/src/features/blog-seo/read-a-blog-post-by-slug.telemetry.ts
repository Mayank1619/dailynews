export type BlogPostAuditEvent = {
  feature: "blog-seo";
  eventName: "blog-post-viewed";
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

export function createBlogPostAuditEvent(
  status: BlogPostAuditEvent["status"],
  metadata: Record<string, unknown>
): BlogPostAuditEvent {
  return {
    feature: "blog-seo",
    eventName: "blog-post-viewed",
    status,
    occurredAt: new Date().toISOString(),
    metadata: sanitizeMetadata(metadata)
  };
}
