export type SeoAuditEvent = {
  feature: "blog-seo";
  eventName: "seo-metadata-generated" | "sitemap-generated" | "rss-feed-generated";
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

export function createSeoAuditEvent(
  eventName: SeoAuditEvent["eventName"],
  status: SeoAuditEvent["status"],
  metadata: Record<string, unknown>
): SeoAuditEvent {
  return {
    feature: "blog-seo",
    eventName,
    status,
    occurredAt: new Date().toISOString(),
    metadata: sanitizeMetadata(metadata)
  };
}
