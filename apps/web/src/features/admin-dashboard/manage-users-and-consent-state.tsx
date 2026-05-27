import React, { useState } from "react";
import { DESIGN_TOKENS } from "../design-system/tokens";

export const MANAGE_USERS_COPY = {
  heading: "Users",
  blockLabel: "Block",
  unblockLabel: "Unblock",
  viewConsentLabel: "View Consent",
  statusActive: "Active",
  statusBlocked: "Blocked",
  consentHeading: "Consent Details",
  confirmBlock: "Confirm block user?",
  confirmUnblock: "Confirm unblock user?"
} as const;

export type AdminUserRow = {
  userId: string;
  emailMasked: string;
  accountStatus: "active" | "blocked";
  createdAt: string;
};

export type UserConsentDetail = {
  newsletter: boolean;
  productUpdates: boolean;
  offers: boolean;
  termsVersion: string;
  consentedAt: string;
};

const containerStyle: React.CSSProperties = {
  padding: 24
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: DESIGN_TOKENS.colors.bgSecondary,
  borderRadius: 8
};

const thStyle: React.CSSProperties = {
  background: DESIGN_TOKENS.colors.brandPrimary,
  color: "#fff",
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 13
};

const tdStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderBottom: `1px solid ${DESIGN_TOKENS.colors.bgPrimary}`,
  fontSize: 13
};

const buttonStyle = (variant: "block" | "unblock" | "consent"): React.CSSProperties => ({
  border: 0,
  borderRadius: 6,
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  marginRight: 6,
  background:
    variant === "block"
      ? DESIGN_TOKENS.colors.error
      : variant === "unblock"
      ? DESIGN_TOKENS.colors.success
      : DESIGN_TOKENS.colors.brandPrimary,
  color: "#fff"
});

export function ManageUsersAndConsentState({
  users,
  onBlockUser,
  onUnblockUser,
  onViewConsent
}: {
  users: AdminUserRow[];
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
  onViewConsent: (userId: string) => void;
}): React.JSX.Element {
  const [pendingAction, setPendingAction] = useState<{ userId: string; action: "block" | "unblock" } | null>(null);

  function handleConfirm() {
    if (!pendingAction) return;
    if (pendingAction.action === "block") onBlockUser(pendingAction.userId);
    else onUnblockUser(pendingAction.userId);
    setPendingAction(null);
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ color: DESIGN_TOKENS.colors.textPrimary, marginBottom: 16 }}>
        {MANAGE_USERS_COPY.heading}
      </h2>

      {pendingAction && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirm action"
          style={{
            background: DESIGN_TOKENS.colors.warning,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            color: DESIGN_TOKENS.colors.textPrimary
          }}
        >
          <p>
            {pendingAction.action === "block"
              ? MANAGE_USERS_COPY.confirmBlock
              : MANAGE_USERS_COPY.confirmUnblock}
          </p>
          <button style={buttonStyle("block")} onClick={handleConfirm}>Confirm</button>
          <button
            style={{ ...buttonStyle("consent"), background: DESIGN_TOKENS.colors.textSecondary }}
            onClick={() => setPendingAction(null)}
          >
            Cancel
          </button>
        </div>
      )}

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>User ID</th>
            <th style={thStyle}>Email (masked)</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Created</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userId}>
              <td style={tdStyle}>{user.userId}</td>
              <td style={tdStyle}>{user.emailMasked}</td>
              <td style={{
                ...tdStyle,
                color: user.accountStatus === "blocked"
                  ? DESIGN_TOKENS.colors.error
                  : DESIGN_TOKENS.colors.success,
                fontWeight: 600
              }}>
                {user.accountStatus === "blocked"
                  ? MANAGE_USERS_COPY.statusBlocked
                  : MANAGE_USERS_COPY.statusActive}
              </td>
              <td style={tdStyle}>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td style={tdStyle}>
                {user.accountStatus !== "blocked" && (
                  <button
                    style={buttonStyle("block")}
                    onClick={() => setPendingAction({ userId: user.userId, action: "block" })}
                    aria-label={`Block user ${user.userId}`}
                  >
                    {MANAGE_USERS_COPY.blockLabel}
                  </button>
                )}
                {user.accountStatus === "blocked" && (
                  <button
                    style={buttonStyle("unblock")}
                    onClick={() => setPendingAction({ userId: user.userId, action: "unblock" })}
                    aria-label={`Unblock user ${user.userId}`}
                  >
                    {MANAGE_USERS_COPY.unblockLabel}
                  </button>
                )}
                <button
                  style={buttonStyle("consent")}
                  onClick={() => onViewConsent(user.userId)}
                  aria-label={`View consent for ${user.userId}`}
                >
                  {MANAGE_USERS_COPY.viewConsentLabel}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
