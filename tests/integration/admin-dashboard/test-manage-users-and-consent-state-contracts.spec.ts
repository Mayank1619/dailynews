import { describe, expect, it, vi } from "vitest";
import {
  ManageUsersAndConsentStateService
} from "../../../apps/api/src/features/admin-dashboard/manage-users-and-consent-state.service";
import { AdminAuditLogService } from "../../../apps/api/src/services/adminAuditLogService";

describe("US2 integration: manage users and consent state contracts", () => {
  it("block action triggers status update and produces audit log entry", async () => {
    const auditSink = vi.fn();
    const setStatus = vi.fn();

    const svc = new ManageUsersAndConsentStateService({
      userRepository: {
        async list() { return { users: [] }; },
        async getConsentSnapshot() { return undefined; },
        async setStatus(userId, status) { setStatus(userId, status); }
      },
      auditLog: new AdminAuditLogService(auditSink),
      telemetry: { track: vi.fn() }
    });

    await svc.updateUserStatus({
      actorUid: "admin-uid",
      actorRole: "admin",
      targetUserId: "target-uid",
      newStatus: "blocked"
    });

    expect(setStatus).toHaveBeenCalledWith("target-uid", "blocked");
    expect(auditSink).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUid: "admin-uid",
        actionType: "block_user",
        targetId: "target-uid",
        outcome: "success"
      })
    );
  });

  it("consent view retrieves snapshot and audit logs the access event", async () => {
    const auditSink = vi.fn();
    const consentFixture = { newsletter: true, productUpdates: false, offers: false, termsVersion: "2026.05", consentedAt: "2026-05-01T00:00:00.000Z" };

    const svc = new ManageUsersAndConsentStateService({
      userRepository: {
        async list() { return { users: [] }; },
        async getConsentSnapshot() { return consentFixture; },
        async setStatus() {}
      },
      auditLog: new AdminAuditLogService(auditSink),
      telemetry: { track: vi.fn() }
    });

    const result = await svc.getUserConsent("admin-uid", "admin", "target-uid");

    expect(result).toEqual(consentFixture);
    expect(auditSink).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: "view_consent", targetId: "target-uid" })
    );
  });

  it("user list result includes required fields per contract", async () => {
    const svc = new ManageUsersAndConsentStateService({
      userRepository: {
        async list() {
          return {
            users: [{
              userId: "uid-1",
              emailMasked: "r***@test.com",
              accountStatus: "active",
              createdAt: "2026-01-01T00:00:00.000Z"
            }]
          };
        },
        async getConsentSnapshot() { return undefined; },
        async setStatus() {}
      },
      auditLog: new AdminAuditLogService(vi.fn()),
      telemetry: { track: vi.fn() }
    });

    const result = await svc.listUsers({ actorUid: "admin-uid", actorRole: "admin" });

    const user = result.users[0];
    expect(user).toHaveProperty("userId");
    expect(user).toHaveProperty("emailMasked");
    expect(user).toHaveProperty("accountStatus");
    expect(user).toHaveProperty("createdAt");
  });
});
