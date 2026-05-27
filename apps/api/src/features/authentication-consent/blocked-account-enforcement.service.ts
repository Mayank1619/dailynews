import { ConsentAuditService } from "../../services/consentAuditService";
import {
  createAuthenticationConsentTelemetryEvent,
  type AuthenticationConsentTelemetry
} from "./secure-signup-with-explicit-consent.telemetry";
import type { UserStatus } from "./login-logout-and-password-recovery.types";

export type BlockedStatusRepository = {
  getStatus: (uid: string) => Promise<UserStatus>;
  setStatus: (uid: string, status: UserStatus) => Promise<void>;
};

export type BlockedAccountDependencies = {
  userStatusRepository: BlockedStatusRepository;
  auditService: Pick<ConsentAuditService, "recordIdentityEvent" | "recordConsentEvent">;
  telemetry: AuthenticationConsentTelemetry;
};

type BlockOptions = {
  adminUid: string;
  reason?: string;
};

type UnblockOptions = {
  adminUid: string;
};

export class BlockedAccountEnforcementService {
  constructor(private readonly deps: BlockedAccountDependencies) {}

  async isUserBlocked(uid: string): Promise<boolean> {
    const status = await this.deps.userStatusRepository.getStatus(uid);
    return status === "blocked";
  }

  async enforceNotBlocked(uid: string): Promise<void> {
    const blocked = await this.isUserBlocked(uid);
    if (blocked) {
      throw new Error("Account is blocked");
    }
  }

  async blockUser(uid: string, options: BlockOptions): Promise<void> {
    await this.deps.userStatusRepository.setStatus(uid, "blocked");

    // Sanitize reason to avoid PII in telemetry: truncate and strip email-like patterns
    const safeReason = sanitizeReason(options.reason);

    await this.deps.telemetry.track(
      createAuthenticationConsentTelemetryEvent("admin_blocked_account", "success", {
        uid,
        adminUid: options.adminUid,
        ...(safeReason ? { reason: safeReason } : {})
      })
    );
  }

  async unblockUser(uid: string, options: UnblockOptions): Promise<void> {
    await this.deps.userStatusRepository.setStatus(uid, "active");

    await this.deps.telemetry.track(
      createAuthenticationConsentTelemetryEvent("admin_unblocked_account", "success", {
        uid,
        adminUid: options.adminUid
      })
    );
  }
}

/** Strip email addresses and limit length to keep reason PII-safe for telemetry */
function sanitizeReason(reason?: string): string | undefined {
  if (!reason) return undefined;
  const stripped = reason.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[redacted]");
  return stripped.slice(0, 120);
}
