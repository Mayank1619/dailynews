/**
 * Payments / Subscriptions Telemetry
 *
 * Tracks subscription lifecycle events without card, invoice, or secret data.
 */

export type PaymentsSubscriptionsTelemetryEvent = {
  feature: "payments-subscriptions";
  eventName:
    | "subscription.trial_started"
    | "subscription.status_viewed"
    | "subscription.checkout_started"
    | "subscription.entitlement_checked"
    | "subscription.provider_not_configured";
  status: "success" | "error";
  occurredAt: string;
  metadata: Record<string, string | number | boolean>;
};

export type PaymentsSubscriptionsTelemetry = {
  track: (event: PaymentsSubscriptionsTelemetryEvent) => void | Promise<void>;
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

export function createPaymentsSubscriptionsTelemetryEvent(
  eventName: PaymentsSubscriptionsTelemetryEvent["eventName"],
  status: PaymentsSubscriptionsTelemetryEvent["status"],
  metadata: Record<string, unknown> = {}
): PaymentsSubscriptionsTelemetryEvent {
  return {
    feature: "payments-subscriptions",
    eventName,
    status,
    occurredAt: new Date().toISOString(),
    metadata: sanitizeMetadata(metadata),
  };
}
