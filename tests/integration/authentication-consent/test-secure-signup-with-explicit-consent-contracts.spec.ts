import { describe, expect, it, vi } from "vitest";
import {
  verifyFirebaseIdToken,
  type FirebaseRequestContext
} from "../../../apps/api/src/middleware/firebaseAuth";
import { SecureSignupWithExplicitConsentService } from "../../../apps/api/src/features/authentication-consent/secure-signup-with-explicit-consent.service";
import type { ConsentRecord } from "../../../apps/api/src/features/authentication-consent/secure-signup-with-explicit-consent.types";

describe("US1 integration: secure signup with explicit consent contracts", () => {
  it("binds verified firebase identity and persists consent contract fields", async () => {
    const context: FirebaseRequestContext = {
      headers: {
        authorization: "Bearer firebase-token"
      }
    };

    const verifiedContext = await verifyFirebaseIdToken(context, {
      async verifyIdToken(idToken: string) {
        expect(idToken).toBe("firebase-token");
        return {
          uid: "firebase-uid-1",
          email: "reader@dailypaper.test",
          email_verified: false
        };
      }
    });

    const consentRepository = {
      async save(record: ConsentRecord): Promise<ConsentRecord> {
        expect(record.uid).toBe("firebase-uid-1");
        expect(record.newsletter).toBe(true);
        expect(record.termsVersion).toBe("2026.05");
        return record;
      }
    };

    const service = new SecureSignupWithExplicitConsentService({
      identityProvider: {
        async registerWithEmailPassword() {
          return { uid: "firebase-uid-1", emailVerified: false };
        }
      },
      consentRepository,
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
    });

    const result = await service.secureSignup({
      email: verifiedContext.auth?.email ?? "reader@dailypaper.test",
      password: "StrongPassword-1234",
      consent: {
        newsletter: true,
        termsVersion: "2026.05"
      },
      source: "api-auth-signup"
    });

    expect(result.uid).toBe("firebase-uid-1");
    expect(result.consent.termsVersion).toBe("2026.05");
  });

  it("rejects missing bearer token before consent processing", async () => {
    await expect(
      verifyFirebaseIdToken({ headers: {} }, {
        async verifyIdToken() {
          throw new Error("should not execute");
        }
      })
    ).rejects.toThrow("Missing Firebase bearer token");
  });
});
