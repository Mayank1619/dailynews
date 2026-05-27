import type { UserStatus } from "./login-logout-and-password-recovery.types";

export type { UserStatus };

export type BlockedAccountStatus = {
  uid: string;
  status: UserStatus;
  updatedAt: string;
};

export type BlockStatusChangeRequest = {
  targetUid: string;
  adminUid: string;
  reason?: string;
};

export type BlockStatusChangeResponse = {
  uid: string;
  status: UserStatus;
  updatedAt: string;
};

export type BlockedAccessDeniedEvent = {
  feature: "authentication-consent";
  eventName: "blocked_access_denied";
  uid: string;
  source: string;
  occurredAt: string;
};
