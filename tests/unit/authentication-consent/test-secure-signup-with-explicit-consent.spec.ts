import { describe, expect, it, vi } from "vitest";
import {
  SecureSignupWithExplicitConsentService,
  type SecureSignupDependencies
} from "../../../apps/api/src/features/authentication-consent/secure-signup-with-explicit-consent.service";
import type {
  ConsentRecord,
  SecureSignupCommand
} from "../../../apps/api/src/features/authentication-consent/secure-signup-with-explicit-consent.types";

function createDependencies(): SecureSignupDependencies {
  return {
    identityProvider: {
      async registerWithEmailPassword(email: string) {
        return { uid: `uid-${email}`, emailVerified: false };
      }
    },
    consentRepository: {
      async save(record: ConsentRecord) {
        return record;
      }
    },
    auditService: {
      async recordIdentityEvent() {
        return;
      },
      async recordConsentEvent() {
        return;
      }
    },
    telemetry: {
      track: vi.fn()
    },
    now: () => new Date("2026-05-26T10:00:00.000Z")
  };
}

describe("US1 unit: secure signup with explicit consent", () => {
  it("stores explicit required consent and defaults optional controls to false", async () => {
    const service = new SecureSignupWithExplicitConsentService(createDependencies());
    const command: SecureSignupCommand = {
      email: "reader@dailypaper.test",
      password: "StrongPassword-1234",
      consent: {
        newsletter: true,
        termsVersion: "2026.05"
      },
      source: "signup-form"
    };

    const result = await service.secureSignup(command);

    expect(result.uid).toContain("uid-reader@dailypaper.test");
    expect(result.consent.newsletter).toBe(true);
    expect(result.consent.productUpdates).toBe(false);
    expect(result.consent.offers).toBe(false);
    expect(result.consent.consentedAt).toBe("2026-05-26T10:00:00.000Z");
  });

  it("rejects signup when required newsletter consent is not granted", async () => {
    const service = new SecureSignupWithExplicitConsentService(createDependencies());

    await expect(
      service.secureSignup({
        email: "reader@dailypaper.test",
        password: "StrongPassword-1234",
        consent: {
          newsletter: false,
          termsVersion: "2026.05"
        },
        source: "signup-form"
      })
    ).rejects.toThrow("Newsletter consent is required for signup");
  });
});
