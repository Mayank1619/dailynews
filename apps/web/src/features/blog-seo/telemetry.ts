type BlogSeoHealthEventName =
  | "blog-index-available"
  | "blog-post-available"
  | "blog-sitemap-available"
  | "blog-feed-available"
  | "seo-metadata-generated";

type BlogSeoHealthEvent = {
  feature: "blog-seo";
  eventName: BlogSeoHealthEventName;
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

export function createBlogSeoHealthEvent(
  eventName: BlogSeoHealthEventName,
  status: BlogSeoHealthEvent["status"],
  metadata: Record<string, unknown>
): BlogSeoHealthEvent {
  return {
    feature: "blog-seo",
    eventName,
    status,
    occurredAt: new Date().toISOString(),
    metadata: sanitizeMetadata(metadata)
  };
}
