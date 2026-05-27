import { describe, expect, it, vi } from "vitest";
import {
  BlockedAccountEnforcementService,
  type BlockedAccountDependencies
} from "../../../apps/api/src/features/authentication-consent/blocked-account-enforcement.service";

function createDeps(
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

describe("US3 unit: blocked account enforcement", () => {
  describe("isUserBlocked", () => {
    it("returns false when user status is active", async () => {
      const service = new BlockedAccountEnforcementService(createDeps());
      const result = await service.isUserBlocked("uid-active");
      expect(result).toBe(false);
    });

    it("returns true when user status is blocked", async () => {
      const service = new BlockedAccountEnforcementService(
        createDeps({
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
      const result = await service.isUserBlocked("uid-blocked");
      expect(result).toBe(true);
    });
  });

  describe("enforceNotBlocked", () => {
    it("resolves without error for active users", async () => {
      const service = new BlockedAccountEnforcementService(createDeps());
      await expect(service.enforceNotBlocked("uid-active")).resolves.toBeUndefined();
    });

    it("throws with 'Account is blocked' for blocked users", async () => {
      const service = new BlockedAccountEnforcementService(
        createDeps({
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
      await expect(service.enforceNotBlocked("uid-b")).rejects.toThrow("Account is blocked");
    });
  });

  describe("blockUser", () => {
    it("calls setStatus with 'blocked' for the given uid", async () => {
      const setStatus = vi.fn().mockResolvedValue(undefined);
      const service = new BlockedAccountEnforcementService(
        createDeps({
          userStatusRepository: {
            async getStatus() {
              return "active" as const;
            },
            setStatus
          }
        })
      );
      await service.blockUser("uid-1", { adminUid: "admin", reason: "spam" });
      expect(setStatus).toHaveBeenCalledWith("uid-1", "blocked");
    });

    it("emits admin_blocked_account telemetry event", async () => {
      const track = vi.fn();
      const service = new BlockedAccountEnforcementService(
        createDeps({
          telemetry: { track }
        })
      );
      await service.blockUser("uid-1", { adminUid: "admin", reason: "spam" });
      const events = track.mock.calls.map((c: unknown[]) => (c[0] as { eventName: string }).eventName);
      expect(events).toContain("admin_blocked_account");
    });

    it("does not include reason verbatim in telemetry if it could be PII", async () => {
      const track = vi.fn();
      const service = new BlockedAccountEnforcementService(
        createDeps({ telemetry: { track } })
      );
      await service.blockUser("uid-1", { adminUid: "admin", reason: "reported by user@secret.com" });
      const payloads = JSON.stringify(track.mock.calls);
      // reason is truncated / redacted in telemetry
      expect(payloads).not.toContain("user@secret.com");
    });
  });

  describe("unblockUser", () => {
    it("calls setStatus with 'active' for the given uid", async () => {
      const setStatus = vi.fn().mockResolvedValue(undefined);
      const service = new BlockedAccountEnforcementService(
        createDeps({
          userStatusRepository: {
            async getStatus() {
              return "blocked" as const;
            },
            setStatus
          }
        })
      );
      await service.unblockUser("uid-1", { adminUid: "admin" });
      expect(setStatus).toHaveBeenCalledWith("uid-1", "active");
    });

    it("emits admin_unblocked_account telemetry event", async () => {
      const track = vi.fn();
      const service = new BlockedAccountEnforcementService(
        createDeps({ telemetry: { track } })
      );
      await service.unblockUser("uid-1", { adminUid: "admin" });
      const events = track.mock.calls.map((c: unknown[]) => (c[0] as { eventName: string }).eventName);
      expect(events).toContain("admin_unblocked_account");
    });
  });

  describe("newsletter delivery exclusion", () => {
    it("isUserBlocked returns true which callers use to exclude from delivery list", async () => {
      const service = new BlockedAccountEnforcementService(
        createDeps({
          userStatusRepository: {
            async getStatus(_uid: string) {
              return "blocked" as const;
            },
            async setStatus() {
              return;
            }
          }
        })
      );
      const uid = "uid-blocked-reader";
      const blocked = await service.isUserBlocked(uid);
      // Newsletter delivery service should filter out recipients where isUserBlocked === true
      expect(blocked).toBe(true);
    });
  });
});
