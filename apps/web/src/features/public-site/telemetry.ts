type LandingHealthEventName =
  | "landing-page-available"
  | "cta-signup-available"
  | "login-link-available"
  | "blog-link-available";

type LandingHealthEvent = {
  feature: "public-site";
  eventName: LandingHealthEventName;
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

export function createLandingHealthEvent(
  eventName: LandingHealthEventName,
  status: LandingHealthEvent["status"],
  metadata: Record<string, unknown>
): LandingHealthEvent {
  return {
    feature: "public-site",
    eventName,
    status,
    occurredAt: new Date().toISOString(),
    metadata: sanitizeMetadata(metadata)
  };
}
