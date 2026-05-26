import { ConsentAuditService } from "../../services/consentAuditService";
import {
  createAuthenticationConsentTelemetryEvent,
  type AuthenticationConsentTelemetry
} from "./secure-signup-with-explicit-consent.telemetry";
import type {
  AuthIdentityRecord,
  ConsentRecord,
  SecureSignupCommand,
  SecureSignupResult
} from "./secure-signup-with-explicit-consent.types";

export type SecureSignupDependencies = {
  identityProvider: {
    registerWithEmailPassword: (email: string, password: string) => Promise<AuthIdentityRecord>;
  };
  consentRepository: {
    save: (record: ConsentRecord) => Promise<ConsentRecord>;
  };
  auditService: Pick<ConsentAuditService, "recordIdentityEvent" | "recordConsentEvent">;
  telemetry: AuthenticationConsentTelemetry;
  now: () => Date;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class SecureSignupWithExplicitConsentService {
  constructor(private readonly dependencies: SecureSignupDependencies) {}

  async secureSignup(command: SecureSignupCommand): Promise<SecureSignupResult> {
    this.validate(command);

    await this.dependencies.auditService.recordIdentityEvent({
      uid: command.email,
      eventName: "signup_attempt",
      source: command.source,
      ipAddress: command.ipAddress,
      userAgent: command.userAgent
    });

    try {
      const identity = await this.dependencies.identityProvider.registerWithEmailPassword(command.email, command.password);
      const consentRecord: ConsentRecord = {
        uid: identity.uid,
        newsletter: command.consent.newsletter,
        productUpdates: command.consent.productUpdates ?? false,
        offers: command.consent.offers ?? false,
        termsVersion: command.consent.termsVersion,
        consentedAt: this.dependencies.now().toISOString()
      };

      const persistedConsent = await this.dependencies.consentRepository.save(consentRecord);

      await this.dependencies.auditService.recordIdentityEvent({
        uid: identity.uid,
        eventName: "signup_success",
        source: command.source,
        ipAddress: command.ipAddress,
        userAgent: command.userAgent
      });

      await this.dependencies.auditService.recordConsentEvent({
        uid: identity.uid,
        newsletter: persistedConsent.newsletter,
        productUpdates: persistedConsent.productUpdates,
        offers: persistedConsent.offers,
        termsVersion: persistedConsent.termsVersion,
        source: command.source
      });

      await this.dependencies.telemetry.track(
        createAuthenticationConsentTelemetryEvent("secure_signup_succeeded", "success", {
          uid: identity.uid,
          source: command.source,
          emailVerified: identity.emailVerified,
          termsVersion: persistedConsent.termsVersion,
          newsletter: persistedConsent.newsletter,
          productUpdates: persistedConsent.productUpdates,
          offers: persistedConsent.offers
        })
      );

      return {
        uid: identity.uid,
        emailVerified: identity.emailVerified,
        consent: persistedConsent
      };
    } catch (error) {
      await this.dependencies.auditService.recordIdentityEvent({
        uid: command.email,
        eventName: "signup_failed",
        source: command.source,
        ipAddress: command.ipAddress,
        userAgent: command.userAgent
      });

      await this.dependencies.telemetry.track(
        createAuthenticationConsentTelemetryEvent("secure_signup_failed", "error", {
          source: command.source,
          reason: error instanceof Error ? error.message : "unknown"
        })
      );

      throw error;
    }
  }

  private validate(command: SecureSignupCommand): void {
    if (!EMAIL_REGEX.test(command.email)) {
      throw new Error("Email must be valid");
    }

    if (command.password.length < 12) {
      throw new Error("Password must be at least 12 characters");
    }

    if (!command.consent.newsletter) {
      throw new Error("Newsletter consent is required for signup");
    }

    if (!command.consent.termsVersion.trim()) {
      throw new Error("Terms version is required for consent capture");
    }
  }
}
