import { describe, expect, it, vi } from "vitest";
import {
  SecureAdminAccessAndGovernanceService,
  type SecureAdminAccessDependencies
} from "../../../apps/api/src/features/admin-dashboard/secure-admin-access-and-governance.service";
import { AdminAuditLogService } from "../../../apps/api/src/services/adminAuditLogService";

function createDeps(overrides: Partial<SecureAdminAccessDependencies> = {}): SecureAdminAccessDependencies {
  return {
    tokenVerifier: {
      async verifyIdToken() {
        return { uid: "admin-uid-1", email: "admin@dailypaper.test", role: "admin" };
      }
    },
    auditLog: new AdminAuditLogService(vi.fn()),
    telemetry: { track: vi.fn() },
    ...overrides
  };
}

describe("US1 unit: secure admin access and governance", () => {
  it("grants access to a user with admin claim", async () => {
    const deps = createDeps({
      tokenVerifier: {
        async verifyIdToken() {
          return { uid: "admin-uid-1", email: "admin@dailypaper.test", role: "admin" };
        }
      }
    });

    const svc = new SecureAdminAccessAndGovernanceService(deps);
    const result = await svc.verifyAdminAccess({ idToken: "valid-token", route: "/admin" });

    expect(result.uid).toBe("admin-uid-1");
    expect(result.role).toBe("admin");
    expect(result.route).toBe("/admin");
  });

  it("denies access and writes audit log for a user without admin claim", async () => {
    const auditSink = vi.fn();
    const deps = createDeps({
      tokenVerifier: {
        async verifyIdToken() {
          return { uid: "regular-uid", email: "user@dailypaper.test" };
        }
      },
      auditLog: new AdminAuditLogService(auditSink)
    });

    const svc = new SecureAdminAccessAndGovernanceService(deps);

    await expect(svc.verifyAdminAccess({ idToken: "user-token", route: "/admin" })).rejects.toThrow(
      "Insufficient permissions"
    );

    expect(auditSink).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "denied", actionType: "access_denied" })
    );
  });

  it("returns empty activity list when no repository is configured", async () => {
    const deps = createDeps();
    const svc = new SecureAdminAccessAndGovernanceService(deps);
    const records = await svc.getRecentActivity();
    expect(records).toEqual([]);
  });

  it("super_admin claim is also accepted", async () => {
    const deps = createDeps({
      tokenVerifier: {
        async verifyIdToken() {
          return { uid: "super-uid", email: "super@dailypaper.test", role: "super_admin" };
        }
      }
    });

    const svc = new SecureAdminAccessAndGovernanceService(deps);
    const result = await svc.verifyAdminAccess({ idToken: "super-token", route: "/admin/users" });
    expect(result.role).toBe("super_admin");
  });
});
