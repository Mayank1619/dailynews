import { verifyFirebaseIdToken, type FirebaseTokenVerifier } from "../../middleware/firebaseAuth";
import { requireAdminClaim, type AdminRole } from "../../middleware/rbacClaims";
import { AdminAuditLogService } from "../../services/adminAuditLogService";
import {
  createAdminDashboardTelemetryEvent,
  type AdminDashboardTelemetry
} from "./secure-admin-access-and-governance.telemetry";
import type {
  AdminAccessCheckInput,
  AdminAccessCheckResult,
  AdminActivityRecord
} from "./secure-admin-access-and-governance.types";

export type SecureAdminAccessDependencies = {
  tokenVerifier: FirebaseTokenVerifier;
  auditLog: AdminAuditLogService;
  activityRepository?: {
    getRecent: (limit: number) => Promise<AdminActivityRecord[]>;
  };
  telemetry: AdminDashboardTelemetry;
};

export class SecureAdminAccessAndGovernanceService {
  constructor(private readonly deps: SecureAdminAccessDependencies) {}

  async verifyAdminAccess(input: AdminAccessCheckInput): Promise<AdminAccessCheckResult> {
    const context = await verifyFirebaseIdToken(
      { headers: { authorization: `Bearer ${input.idToken}` } },
      this.deps.tokenVerifier
    );

    let role: AdminRole;
    try {
      const claims = requireAdminClaim(context.auth!.token);
      role = claims.role;
    } catch {
      await this.deps.auditLog.record({
        actorUid: context.auth?.uid ?? "unknown",
        actorRole: "none",
        actionType: "access_denied",
        targetType: "route",
        targetId: input.route,
        outcome: "denied",
        reason: "Missing admin claim"
      });

      await this.deps.telemetry.track(
        createAdminDashboardTelemetryEvent("admin_access_denied", "denied", {
          route: input.route
        })
      );

      throw new Error("Insufficient permissions: admin role required");
    }

    await this.deps.auditLog.record({
      actorUid: context.auth!.uid,
      actorRole: role,
      actionType: "access_granted",
      targetType: "route",
      targetId: input.route,
      outcome: "success"
    });

    await this.deps.telemetry.track(
      createAdminDashboardTelemetryEvent("admin_access_granted", "success", {
        route: input.route,
        role
      })
    );

    return { uid: context.auth!.uid, role, route: input.route };
  }

  async getRecentActivity(limit = 50): Promise<AdminActivityRecord[]> {
    if (!this.deps.activityRepository) return [];
    return this.deps.activityRepository.getRecent(limit);
  }
}
