import {
  createAuthenticationConsentTelemetryEvent,
  type AuthenticationConsentTelemetry,
  type AuthenticationConsentTelemetryEvent
} from "./secure-signup-with-explicit-consent.telemetry";

/** All US2 telemetry event names */
export type LoginLogoutTelemetryEventName =
  | "login_attempt"
  | "login_success"
  | "login_failure"
  | "logout"
  | "password_reset_requested"
  | "password_reset_completed"
  | "blocked_access_denied";

/**
 * Creates a privacy-safe US2 telemetry event.
 * NEVER include passwords, reset tokens, or raw email addresses in metadata.
 */
export function createLoginLogoutTelemetryEvent(
  eventName: LoginLogoutTelemetryEventName,
  status: AuthenticationConsentTelemetryEvent["status"],
  metadata: Record<string, string | number | boolean>
): AuthenticationConsentTelemetryEvent {
  return createAuthenticationConsentTelemetryEvent(eventName, status, metadata);
}

/**
 * Creates a console-sink telemetry instance for US2.
 * Swap the sink in production for a real analytics provider.
 */
export function createLoginLogoutTelemetry(
  sink: (event: AuthenticationConsentTelemetryEvent) => void | Promise<void> = (e) =>
    console.info(JSON.stringify(e))
): AuthenticationConsentTelemetry {
  return {
    async track(event: AuthenticationConsentTelemetryEvent): Promise<void> {
      await sink(event);
    }
  };
}
