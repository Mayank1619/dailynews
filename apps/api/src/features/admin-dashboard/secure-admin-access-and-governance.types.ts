import type { AdminRole } from "../../middleware/rbacClaims";

export type AdminAccessOutcome = "granted" | "denied";

export type AdminAccessEvent = {
  actorUid: string;
  actorRole: AdminRole | null;
  route: string;
  outcome: AdminAccessOutcome;
  deniedReason?: string;
  timestamp: string;
};

export type AdminActivityRecord = {
  actorUid: string;
  actorRole: string;
  actionType: string;
  targetType: string;
  targetId: string;
  outcome: string;
  timestamp: string;
};

export type AdminAccessCheckInput = {
  idToken: string;
  route: string;
};

export type AdminAccessCheckResult = {
  uid: string;
  role: AdminRole;
  route: string;
};
