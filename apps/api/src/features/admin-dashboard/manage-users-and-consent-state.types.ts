export type AccountStatus = "active" | "blocked";

export type UserConsentSnapshot = {
  newsletter: boolean;
  productUpdates: boolean;
  offers: boolean;
  termsVersion: string;
  consentedAt: string;
};

export type AdminUserView = {
  userId: string;
  emailMasked: string;
  accountStatus: AccountStatus;
  createdAt: string;
  consentSnapshot?: UserConsentSnapshot;
  preferenceSnapshot?: Record<string, string | boolean>;
};

export type UserStatusUpdateCommand = {
  actorUid: string;
  actorRole: string;
  targetUserId: string;
  newStatus: AccountStatus;
  reason?: string;
};

export type UserListQuery = {
  actorUid: string;
  actorRole: string;
  pageSize?: number;
  pageToken?: string;
};

export type UserListResult = {
  users: AdminUserView[];
  nextPageToken?: string;
};
