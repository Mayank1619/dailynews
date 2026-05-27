import { describe, expect, it, vi } from "vitest";
import {
  verifyFirebaseIdToken,
  type FirebaseRequestContext
} from "../../../apps/api/src/middleware/firebaseAuth";
import type {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse
} from "../../../apps/api/src/features/authentication-consent/login-logout-and-password-recovery.types";
import {
  LoginLogoutAndPasswordRecoveryService,
  type LoginLogoutDependencies
} from "../../../apps/api/src/features/authentication-consent/login-logout-and-password-recovery.service";

function createDeps(overrides?: Partial<LoginLogoutDependencies>): LoginLogoutDependencies {
  return {
    identityProvider: {
      async signInWithEmailPassword(_email: string, _password: string) {
        return { uid: "uid-1", emailVerified: true, idToken: "mock-token" };
      },
      async revokeRefreshTokens(_uid: string) {
        return;
      },
      async sendPasswordResetEmail(_email: string) {
        return;
      }
    },
    userStatusRepository: {
      async getStatus(_uid: string) {
        return "active" as const;
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
    telemetry: { track: vi.fn() },
    now: () => new Date("2026-05-27T10:00:00.000Z"),
    ...overrides
  };
}

describe("US2 integration: login, logout, and password recovery contracts", () => {
  it("verifies firebase bearer token prior to protected operations", async () => {
    const context: FirebaseRequestContext = {
      headers: { authorization: "Bearer mock-token" }
    };

    const verified = await verifyFirebaseIdToken(context, {
      async verifyIdToken(token: string) {
        expect(token).toBe("mock-token");
        return { uid: "uid-1", email: "user@dailypaper.test", email_verified: true };
      }
    });

    expect(verified.auth?.uid).toBe("uid-1");
  });

  it("rejects missing bearer token before login is processed", async () => {
    await expect(
      verifyFirebaseIdToken({ headers: {} }, {
        async verifyIdToken() {
          throw new Error("should not execute");
        }
      })
    ).rejects.toThrow("Missing Firebase bearer token");
  });

  it("login contract: returns uid and idToken on success", async () => {
    const service = new LoginLogoutAndPasswordRecoveryService(createDeps());
    const req: LoginRequest = {
      email: "user@dailypaper.test",
      password: "SecurePass-1",
      source: "login-form"
    };

    const result: LoginResponse = await service.loginUser(req);

    expect(result.uid).toBe("uid-1");
    expect(result.idToken).toBe("mock-token");
    expect(result.emailVerified).toBe(true);
  });

  it("logout contract: calls revokeRefreshTokens for uid", async () => {
    const revoke = vi.fn().mockResolvedValue(undefined);
    const service = new LoginLogoutAndPasswordRecoveryService(
      createDeps({
        identityProvider: {
          async signInWithEmailPassword() {
            return { uid: "uid-1", emailVerified: true, idToken: "mock-token" };
          },
          revokeRefreshTokens: revoke,
          async sendPasswordResetEmail() {
            return;
          }
        }
      })
    );

    const req: LogoutRequest = { uid: "uid-1", source: "session" };
    const result: LogoutResponse = await service.logoutUser(req);

    expect(revoke).toHaveBeenCalledWith("uid-1");
    expect(result.success).toBe(true);
  });

  it("forgot-password contract: always returns non-enumeration message regardless of email existence", async () => {
    const service = new LoginLogoutAndPasswordRecoveryService(createDeps());
    const req: ForgotPasswordRequest = {
      email: "nonexistent@dailypaper.test",
      source: "forgot-password-form"
    };

    const result: ForgotPasswordResponse = await service.requestPasswordReset(req);

    expect(result.message).toMatch(/If an account exists/i);
  });

  it("forgot-password contract: same response shape even when provider throws NOT_FOUND", async () => {
    const service = new LoginLogoutAndPasswordRecoveryService(
      createDeps({
        identityProvider: {
          async signInWithEmailPassword() {
            return { uid: "", emailVerified: false, idToken: "" };
          },
          async revokeRefreshTokens() {
            return;
          },
          async sendPasswordResetEmail() {
            throw Object.assign(new Error("USER_NOT_FOUND"), { code: "auth/user-not-found" });
          }
        }
      })
    );

    const result: ForgotPasswordResponse = await service.requestPasswordReset({
      email: "ghost@dailypaper.test",
      source: "forgot-password-form"
    });

    expect(result.message).toMatch(/If an account exists/i);
  });
});
