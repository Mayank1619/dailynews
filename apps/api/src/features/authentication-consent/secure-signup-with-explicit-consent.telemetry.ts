export type AuthenticationConsentTelemetryEvent = {
  feature: "authentication-consent";
  eventName: string;
  status: "success" | "error";
  occurredAt: string;
  metadata: Record<string, string | number | boolean>;
};

export type AuthenticationConsentTelemetry = {
  track: (event: AuthenticationConsentTelemetryEvent) => void | Promise<void>;
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

export function createAuthenticationConsentTelemetryEvent(
  eventName: string,
  status: AuthenticationConsentTelemetryEvent["status"],
  metadata: Record<string, unknown>
): AuthenticationConsentTelemetryEvent {
  return {
    feature: "authentication-consent",
    eventName,
    status,
    occurredAt: new Date().toISOString(),
    metadata: sanitizeMetadata(metadata)
  };
}
