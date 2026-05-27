import {
  createAuthenticationConsentTelemetryEvent,
  type AuthenticationConsentTelemetry,
  type AuthenticationConsentTelemetryEvent
} from "./secure-signup-with-explicit-consent.telemetry";

/** All US3 telemetry event names */
export type BlockedAccountTelemetryEventName =
  | "blocked_login_denied"
  | "admin_blocked_account"
  | "admin_unblocked_account";

/**
 * Creates a privacy-safe US3 telemetry event.
 * NEVER include raw email addresses, passwords, or PII in metadata.
 */
export function createBlockedAccountTelemetryEvent(
  eventName: BlockedAccountTelemetryEventName,
  status: AuthenticationConsentTelemetryEvent["status"],
  metadata: Record<string, string | number | boolean>
): AuthenticationConsentTelemetryEvent {
  return createAuthenticationConsentTelemetryEvent(eventName, status, metadata);
}

/**
 * Creates a console-sink telemetry instance for US3.
 */
export function createBlockedAccountTelemetry(
  sink: (event: AuthenticationConsentTelemetryEvent) => void | Promise<void> = (e) =>
    console.info(JSON.stringify(e))
): AuthenticationConsentTelemetry {
  return {
    async track(event: AuthenticationConsentTelemetryEvent): Promise<void> {
      await sink(event);
    }
  };
}
