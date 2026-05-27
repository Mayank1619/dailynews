import { describe, expect, it, vi } from "vitest";
import {
  ManageUsersAndConsentStateService,
  type ManageUsersDependencies,
  type UserRepository
} from "../../../apps/api/src/features/admin-dashboard/manage-users-and-consent-state.service";
import { AdminAuditLogService } from "../../../apps/api/src/services/adminAuditLogService";

function createUserRepository(): UserRepository {
  const users = [
    {
      userId: "uid-1",
      emailMasked: "r***@dailypaper.test",
      accountStatus: "active" as const,
      createdAt: "2026-01-01T00:00:00.000Z"
    }
  ];

  return {
    async list() {
      return { users };
    },
    async getConsentSnapshot() {
      return {
        newsletter: true,
        productUpdates: false,
        offers: true,
        termsVersion: "2026.05",
        consentedAt: "2026-05-01T00:00:00.000Z"
      };
    },
    async setStatus() {}
  };
}

function createDeps(overrides?: Partial<ManageUsersDependencies>): ManageUsersDependencies {
  return {
    userRepository: createUserRepository(),
    auditLog: new AdminAuditLogService(vi.fn()),
    telemetry: { track: vi.fn() },
    ...overrides
  };
}

describe("US2 unit: manage users and consent state", () => {
  it("returns user list with account status", async () => {
    const svc = new ManageUsersAndConsentStateService(createDeps());
    const result = await svc.listUsers({ actorUid: "admin-uid", actorRole: "admin" });
    expect(result.users).toHaveLength(1);
    expect(result.users[0].accountStatus).toBe("active");
  });

  it("blocks a user and writes audit log", async () => {
    const auditSink = vi.fn();
    const setStatus = vi.fn();
    const deps = createDeps({
      userRepository: { ...createUserRepository(), setStatus },
      auditLog: new AdminAuditLogService(auditSink)
    });

    const svc = new ManageUsersAndConsentStateService(deps);
    await svc.updateUserStatus({
      actorUid: "admin-uid",
      actorRole: "admin",
      targetUserId: "uid-1",
      newStatus: "blocked"
    });

    expect(setStatus).toHaveBeenCalledWith("uid-1", "blocked");
    expect(auditSink).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: "block_user", outcome: "success" })
    );
  });

  it("unblocks a user and writes audit log", async () => {
    const auditSink = vi.fn();
    const setStatus = vi.fn();
    const deps = createDeps({
      userRepository: { ...createUserRepository(), setStatus },
      auditLog: new AdminAuditLogService(auditSink)
    });

    const svc = new ManageUsersAndConsentStateService(deps);
    await svc.updateUserStatus({
      actorUid: "admin-uid",
      actorRole: "admin",
      targetUserId: "uid-1",
      newStatus: "active"
    });

    expect(auditSink).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: "unblock_user", outcome: "success" })
    );
  });

  it("returns consent snapshot and audit logs access", async () => {
    const auditSink = vi.fn();
    const deps = createDeps({ auditLog: new AdminAuditLogService(auditSink) });

    const svc = new ManageUsersAndConsentStateService(deps);
    const snapshot = await svc.getUserConsent("admin-uid", "admin", "uid-1");

    expect(snapshot?.newsletter).toBe(true);
    expect(snapshot?.termsVersion).toBe("2026.05");
    expect(auditSink).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: "view_consent" })
    );
  });
});
