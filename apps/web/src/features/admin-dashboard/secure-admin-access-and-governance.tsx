import React, { useState } from "react";
import { DESIGN_TOKENS } from "../design-system/tokens";

export const ADMIN_ACCESS_COPY = {
  heading: "Admin Dashboard",
  deniedHeading: "Access Denied",
  deniedMessage: "You do not have permission to access this area.",
  activityHeading: "Recent Admin Activity",
  noActivity: "No recent activity."
} as const;

export type AdminAccessTelemetryClient = {
  track: (eventName: string, metadata: Record<string, string | number | boolean>) => void | Promise<void>;
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

const containerStyle: React.CSSProperties = {
  background: DESIGN_TOKENS.colors.bgPrimary,
  minHeight: "100vh",
  padding: DESIGN_TOKENS.spacing?.[3] ?? 24
} as React.CSSProperties;

const headingStyle: React.CSSProperties = {
  color: DESIGN_TOKENS.colors.textPrimary,
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 16
};

const deniedStyle: React.CSSProperties = {
  background: DESIGN_TOKENS.colors.error,
  color: "#fff",
  borderRadius: 12,
  padding: 24,
  maxWidth: 480,
  margin: "80px auto",
  textAlign: "center"
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: DESIGN_TOKENS.colors.bgSecondary,
  borderRadius: 8,
  overflow: "hidden"
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
  fontSize: 13,
  color: DESIGN_TOKENS.colors.textPrimary
};

export function AdminAccessDenied(): React.JSX.Element {
  return (
    <div style={deniedStyle}>
      <h1 style={{ margin: 0, fontSize: 22 }}>{ADMIN_ACCESS_COPY.deniedHeading}</h1>
      <p style={{ margin: "12px 0 0" }}>{ADMIN_ACCESS_COPY.deniedMessage}</p>
    </div>
  );
}

export function AdminActivityTable({
  records
}: {
  records: AdminActivityRecord[];
}): React.JSX.Element {
  return (
    <section>
      <h2 style={{ ...headingStyle, fontSize: 20 }}>{ADMIN_ACCESS_COPY.activityHeading}</h2>
      {records.length === 0 ? (
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>{ADMIN_ACCESS_COPY.noActivity}</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Actor</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Action</th>
              <th style={thStyle}>Target</th>
              <th style={thStyle}>Outcome</th>
              <th style={thStyle}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={`${r.actorUid}-${r.timestamp}-${i}`}>
                <td style={tdStyle}>{r.actorUid}</td>
                <td style={tdStyle}>{r.actorRole}</td>
                <td style={tdStyle}>{r.actionType}</td>
                <td style={tdStyle}>{r.targetType}/{r.targetId}</td>
                <td style={{ ...tdStyle, color: r.outcome === "success" ? DESIGN_TOKENS.colors.success : DESIGN_TOKENS.colors.error }}>{r.outcome}</td>
                <td style={tdStyle}>{new Date(r.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export function SecureAdminAccessAndGovernance({
  isAdmin = false,
  activityRecords = []
}: {
  isAdmin?: boolean;
  activityRecords?: AdminActivityRecord[];
}): React.JSX.Element {
  if (!isAdmin) {
    return <AdminAccessDenied />;
  }

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>{ADMIN_ACCESS_COPY.heading}</h1>
      <AdminActivityTable records={activityRecords} />
    </div>
  );
}
