import { describe, expect, it, vi } from "vitest";
import {
  verifyFirebaseIdToken,
  type FirebaseRequestContext
} from "../../../apps/api/src/middleware/firebaseAuth";
import { requireAdminClaim } from "../../../apps/api/src/middleware/rbacClaims";
import { AdminAuditLogService } from "../../../apps/api/src/services/adminAuditLogService";
import { SecureAdminAccessAndGovernanceService } from "../../../apps/api/src/features/admin-dashboard/secure-admin-access-and-governance.service";

describe("US1 integration: secure admin access and governance contracts", () => {
  it("accepts admin token and records access-granted audit entry", async () => {
    const auditSink = vi.fn();
    const svc = new SecureAdminAccessAndGovernanceService({
      tokenVerifier: {
        async verifyIdToken(idToken: string) {
          expect(idToken).toBe("admin-id-token");
          return { uid: "admin-uid", email: "admin@dailypaper.test", role: "admin" };
        }
      },
      auditLog: new AdminAuditLogService(auditSink),
      telemetry: { track: vi.fn() }
    });

    const result = await svc.verifyAdminAccess({ idToken: "admin-id-token", route: "/admin" });

    expect(result.uid).toBe("admin-uid");
    expect(result.role).toBe("admin");
    expect(auditSink).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: "access_granted", actorUid: "admin-uid" })
    );
  });

  it("rejects non-admin token and records access-denied audit entry", async () => {
    const auditSink = vi.fn();
    const svc = new SecureAdminAccessAndGovernanceService({
      tokenVerifier: {
        async verifyIdToken() {
          return { uid: "regular-uid", email: "user@dailypaper.test" };
        }
      },
      auditLog: new AdminAuditLogService(auditSink),
      telemetry: { track: vi.fn() }
    });

    await expect(svc.verifyAdminAccess({ idToken: "user-token", route: "/admin/users" })).rejects.toThrow();

    expect(auditSink).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: "access_denied", outcome: "denied" })
    );
  });

  it("verifyFirebaseIdToken extracting uid works with admin claim verifier", async () => {
    const context: FirebaseRequestContext = {
      headers: { authorization: "Bearer firebase-admin-token" }
    };

    const verified = await verifyFirebaseIdToken(context, {
      async verifyIdToken(idToken: string) {
        expect(idToken).toBe("firebase-admin-token");
        return { uid: "admin-uid", email: "admin@dailypaper.test", role: "admin" };
      }
    });

    const claims = requireAdminClaim(verified.auth!.token);
    expect(claims.uid).toBe("admin-uid");
    expect(claims.role).toBe("admin");
  });

  it("requireAdminClaim throws on missing role", () => {
    expect(() => requireAdminClaim({ uid: "uid", email: "u@example.com" })).toThrow(
      "Insufficient permissions"
    );
  });

  it("requireAdminClaim throws on non-admin role value", () => {
    expect(() => requireAdminClaim({ uid: "uid", email: "u@example.com", role: "editor" } as never)).toThrow(
      "Insufficient permissions"
    );
  });
});
