/**
 * Payments / Subscriptions - Phase 2 Placeholder Telemetry
 *
 * Phase 1 telemetry is limited to governance and scope-check signals only.
 * No payment lifecycle, billing, or entitlement-change events are tracked in Phase 1.
 */

export type PaymentsSubscriptionsTelemetryEvent = {
  feature: "payments-subscriptions";
  /**
   * Only governance signals are permitted in Phase 1:
   *   - "phase1.scope_check_passed"
   *   - "phase1.scope_check_failed"
   *   - "phase1.free_tier_confirmed"
   *   - "phase1.reserved_endpoint_blocked"
   */
  eventName:
    | "phase1.scope_check_passed"
    | "phase1.scope_check_failed"
    | "phase1.free_tier_confirmed"
    | "phase1.reserved_endpoint_blocked";
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
