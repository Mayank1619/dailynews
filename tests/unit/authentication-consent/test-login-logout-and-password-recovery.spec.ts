import { describe, expect, it, vi } from "vitest";
import {
  LoginLogoutAndPasswordRecoveryService,
  type LoginLogoutDependencies
} from "../../../apps/api/src/features/authentication-consent/login-logout-and-password-recovery.service";
import type {
  LoginRequest,
  LogoutRequest,
  ForgotPasswordRequest
} from "../../../apps/api/src/features/authentication-consent/login-logout-and-password-recovery.types";

function createDeps(overrides?: Partial<LoginLogoutDependencies>): LoginLogoutDependencies {
  return {
    identityProvider: {
      async signInWithEmailPassword() {
        return { uid: "uid-1", emailVerified: true, idToken: "mock-token" };
      },
      async revokeRefreshTokens() {
        return;
      },
      async sendPasswordResetEmail() {
        return;
      }
    },
    userStatusRepository: {
      async getStatus() {
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

describe("US2 unit: login, logout, and password recovery", () => {
  describe("loginUser", () => {
    it("returns uid and idToken on successful login", async () => {
      const service = new LoginLogoutAndPasswordRecoveryService(createDeps());
      const result = await service.loginUser({
        email: "user@dailypaper.test",
        password: "ValidPass-123",
        source: "login-form"
      });
      expect(result.uid).toBe("uid-1");
      expect(result.idToken).toBe("mock-token");
      expect(result.emailVerified).toBe(true);
    });

    it("tracks login_success telemetry event on successful login", async () => {
      const track = vi.fn();
      const service = new LoginLogoutAndPasswordRecoveryService(
        createDeps({ telemetry: { track } })
      );
      await service.loginUser({
        email: "user@dailypaper.test",
        password: "ValidPass-123",
        source: "login-form"
      });
      const calls = track.mock.calls.map((c: unknown[]) => (c[0] as { eventName: string }).eventName);
      expect(calls).toContain("login_success");
    });

    it("does not include password in telemetry payload", async () => {
      const track = vi.fn();
      const service = new LoginLogoutAndPasswordRecoveryService(
        createDeps({ telemetry: { track } })
      );
      await service.loginUser({
        email: "user@dailypaper.test",
        password: "SuperSecret-111",
        source: "login-form"
      });
      const allPayloads = JSON.stringify(track.mock.calls);
      expect(allPayloads).not.toContain("SuperSecret-111");
    });

    it("rejects login when user status is blocked", async () => {
      const service = new LoginLogoutAndPasswordRecoveryService(
        createDeps({
          userStatusRepository: {
            async getStatus() {
              return "blocked" as const;
            }
          }
        })
      );
      const req: LoginRequest = {
        email: "blocked@dailypaper.test",
        password: "Pass-123",
        source: "login-form"
      };
      await expect(service.loginUser(req)).rejects.toThrow("Account is blocked");
    });

    it("tracks blocked_access_denied when login is attempted on a blocked account", async () => {
      const track = vi.fn();
      const service = new LoginLogoutAndPasswordRecoveryService(
        createDeps({
          userStatusRepository: {
            async getStatus() {
              return "blocked" as const;
            }
          },
          telemetry: { track }
        })
      );
      await expect(
        service.loginUser({ email: "blocked@dailypaper.test", password: "Pass-1", source: "form" })
      ).rejects.toThrow();
      const events = track.mock.calls.map((c: unknown[]) => (c[0] as { eventName: string }).eventName);
      expect(events).toContain("blocked_access_denied");
    });
  });

  describe("logoutUser", () => {
    it("revokes tokens and returns success on logout", async () => {
      const revoke = vi.fn().mockResolvedValue(undefined);
      const service = new LoginLogoutAndPasswordRecoveryService(
        createDeps({
          identityProvider: {
            async signInWithEmailPassword() {
              return { uid: "uid-1", emailVerified: true, idToken: "t" };
            },
            revokeRefreshTokens: revoke,
            async sendPasswordResetEmail() {
              return;
            }
          }
        })
      );
      const req: LogoutRequest = { uid: "uid-1", source: "header-logout-btn" };
      const result = await service.logoutUser(req);
      expect(revoke).toHaveBeenCalledWith("uid-1");
      expect(result.success).toBe(true);
    });

    it("session is invalidated — revokeRefreshTokens called once", async () => {
      const revoke = vi.fn().mockResolvedValue(undefined);
      const service = new LoginLogoutAndPasswordRecoveryService(
        createDeps({
          identityProvider: {
            async signInWithEmailPassword() {
              return { uid: "uid-1", emailVerified: true, idToken: "t" };
            },
            revokeRefreshTokens: revoke,
            async sendPasswordResetEmail() {
              return;
            }
          }
        })
      );
      await service.logoutUser({ uid: "uid-1", source: "user-action" });
      expect(revoke).toHaveBeenCalledTimes(1);
    });
  });

  describe("requestPasswordReset (non-enumeration)", () => {
    it("always returns non-enumeration confirmation message", async () => {
      const service = new LoginLogoutAndPasswordRecoveryService(createDeps());
      const req: ForgotPasswordRequest = {
        email: "anyone@dailypaper.test",
        source: "forgot-password-form"
      };
      const result = await service.requestPasswordReset(req);
      expect(result.message).toMatch(/If an account exists/i);
    });

    it("returns the same message when email is not registered (non-enumeration)", async () => {
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
      const result = await service.requestPasswordReset({
        email: "ghost@dailypaper.test",
        source: "forgot-password-form"
      });
      expect(result.message).toMatch(/If an account exists/i);
    });

    it("does not include email address in telemetry payload", async () => {
      const track = vi.fn();
      const service = new LoginLogoutAndPasswordRecoveryService(
        createDeps({ telemetry: { track } })
      );
      await service.requestPasswordReset({
        email: "private@dailypaper.test",
        source: "forgot-password-form"
      });
      const allPayloads = JSON.stringify(track.mock.calls);
      expect(allPayloads).not.toContain("private@dailypaper.test");
    });
  });
});
