import { describe, expect, it, vi } from "vitest";
import {
  BlockedAccountEnforcementService,
  type BlockedAccountDependencies
} from "../../../apps/api/src/features/authentication-consent/blocked-account-enforcement.service";
import { LoginLogoutAndPasswordRecoveryService } from "../../../apps/api/src/features/authentication-consent/login-logout-and-password-recovery.service";
import type { LoginLogoutDependencies } from "../../../apps/api/src/features/authentication-consent/login-logout-and-password-recovery.service";

function createBlockedDeps(
  overrides?: Partial<BlockedAccountDependencies>
): BlockedAccountDependencies {
  return {
    userStatusRepository: {
      async getStatus() {
        return "active" as const;
      },
      async setStatus() {
        return;
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
    ...overrides
  };
}

function createLoginDeps(userStatus: "active" | "blocked"): LoginLogoutDependencies {
  return {
    identityProvider: {
      async signInWithEmailPassword() {
        return { uid: "uid-blocked", emailVerified: true, idToken: "tok" };
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
        return userStatus;
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
    now: () => new Date("2026-05-27T10:00:00.000Z")
  };
}

describe("US3 integration: blocked account enforcement contracts", () => {
  it("login is denied when user status is blocked", async () => {
    const loginService = new LoginLogoutAndPasswordRecoveryService(createLoginDeps("blocked"));

    await expect(
      loginService.loginUser({
        email: "blocked@dailypaper.test",
        password: "Pass-123",
        source: "login-form"
      })
    ).rejects.toThrow("Account is blocked");
  });

  it("login succeeds when user status is active", async () => {
    const loginService = new LoginLogoutAndPasswordRecoveryService(createLoginDeps("active"));
    const result = await loginService.loginUser({
      email: "active@dailypaper.test",
      password: "Pass-123",
      source: "login-form"
    });
    expect(result.uid).toBe("uid-blocked");
  });

  it("isUserBlocked returns true for blocked users", async () => {
    const service = new BlockedAccountEnforcementService(
      createBlockedDeps({
        userStatusRepository: {
          async getStatus() {
            return "blocked" as const;
          },
          async setStatus() {
            return;
          }
        }
      })
    );
    const blocked = await service.isUserBlocked("uid-1");
    expect(blocked).toBe(true);
  });

  it("enforceNotBlocked throws for blocked users", async () => {
    const service = new BlockedAccountEnforcementService(
      createBlockedDeps({
        userStatusRepository: {
          async getStatus() {
            return "blocked" as const;
          },
          async setStatus() {
            return;
          }
        }
      })
    );
    await expect(service.enforceNotBlocked("uid-1")).rejects.toThrow("Account is blocked");
  });

  it("enforceNotBlocked passes for active users", async () => {
    const service = new BlockedAccountEnforcementService(createBlockedDeps());
    await expect(service.enforceNotBlocked("uid-active")).resolves.toBeUndefined();
  });

  it("blockUser sets status to blocked and emits telemetry", async () => {
    const setStatus = vi.fn().mockResolvedValue(undefined);
    const track = vi.fn();
    const service = new BlockedAccountEnforcementService(
      createBlockedDeps({
        userStatusRepository: {
          async getStatus() {
            return "active" as const;
          },
          setStatus
        },
        telemetry: { track }
      })
    );

    await service.blockUser("uid-1", { adminUid: "admin-uid", reason: "abuse" });

    expect(setStatus).toHaveBeenCalledWith("uid-1", "blocked");
    const events = track.mock.calls.map((c: unknown[]) => (c[0] as { eventName: string }).eventName);
    expect(events).toContain("admin_blocked_account");
  });

  it("unblockUser sets status to active and emits telemetry", async () => {
    const setStatus = vi.fn().mockResolvedValue(undefined);
    const track = vi.fn();
    const service = new BlockedAccountEnforcementService(
      createBlockedDeps({
        userStatusRepository: {
          async getStatus() {
            return "blocked" as const;
          },
          setStatus
        },
        telemetry: { track }
      })
    );

    await service.unblockUser("uid-1", { adminUid: "admin-uid" });

    expect(setStatus).toHaveBeenCalledWith("uid-1", "active");
    const events = track.mock.calls.map((c: unknown[]) => (c[0] as { eventName: string }).eventName);
    expect(events).toContain("admin_unblocked_account");
  });
});
