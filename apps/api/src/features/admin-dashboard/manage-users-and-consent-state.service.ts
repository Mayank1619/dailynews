import { AdminAuditLogService } from "../../services/adminAuditLogService";
import {
  createAdminDashboardTelemetryEvent,
  type AdminDashboardTelemetry
} from "./secure-admin-access-and-governance.telemetry";
import type {
  AdminUserView,
  UserListQuery,
  UserListResult,
  UserStatusUpdateCommand
} from "./manage-users-and-consent-state.types";

export type UserRepository = {
  list: (pageSize?: number, pageToken?: string) => Promise<UserListResult>;
  getConsentSnapshot: (userId: string) => Promise<AdminUserView["consentSnapshot"]>;
  setStatus: (userId: string, status: AdminUserView["accountStatus"]) => Promise<void>;
};

export type ManageUsersDependencies = {
  userRepository: UserRepository;
  auditLog: AdminAuditLogService;
  telemetry: AdminDashboardTelemetry;
};

export class ManageUsersAndConsentStateService {
  constructor(private readonly deps: ManageUsersDependencies) {}

  async listUsers(query: UserListQuery): Promise<UserListResult> {
    const result = await this.deps.userRepository.list(query.pageSize, query.pageToken);

    await this.deps.telemetry.track(
      createAdminDashboardTelemetryEvent("admin_user_list_viewed", "success", {
        actorUid: query.actorUid,
        count: result.users.length
      })
    );

    return result;
  }

  async updateUserStatus(command: UserStatusUpdateCommand): Promise<void> {
    await this.deps.userRepository.setStatus(command.targetUserId, command.newStatus);

    const actionType = command.newStatus === "blocked" ? "block_user" : "unblock_user";

    await this.deps.auditLog.record({
      actorUid: command.actorUid,
      actorRole: command.actorRole,
      actionType,
      targetType: "user",
      targetId: command.targetUserId,
      outcome: "success",
      reason: command.reason
    });

    await this.deps.telemetry.track(
      createAdminDashboardTelemetryEvent(`admin_user_${command.newStatus}`, "success", {
        actorUid: command.actorUid,
        targetUserId: command.targetUserId
      })
    );
  }

  async getUserConsent(actorUid: string, actorRole: string, targetUserId: string): Promise<AdminUserView["consentSnapshot"]> {
    const snapshot = await this.deps.userRepository.getConsentSnapshot(targetUserId);

    await this.deps.auditLog.record({
      actorUid,
      actorRole,
      actionType: "view_consent",
      targetType: "user",
      targetId: targetUserId,
      outcome: "success"
    });

    return snapshot;
  }
}
