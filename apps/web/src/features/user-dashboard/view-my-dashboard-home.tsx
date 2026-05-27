import React from "react";
import { DESIGN_TOKENS } from "../design-system/tokens";

export type DashboardHomeResponse = {
  preferenceSummary: {
    topics: string[];
    region: string;
    deliveryTimeLocal: string;
    newsletterEnabled: boolean;
  } | null;
  history: Array<{ newsletterId: string; date: string; status: "sent" | "failed" | "skipped"; viewUrl?: string }>;
  emptyHistory: boolean;
};

export const DASHBOARD_HOME_COPY = {
  heading: "Your dashboard",
  preferenceCardHeading: "Preferences summary",
  historyHeading: "Recent newsletters",
  emptyHistory:
    "No newsletter history yet. Save your preferences and keep delivery active to receive your first digest.",
  editPreferences: "Edit Preferences",
  deliveryActive: "Active",
  deliveryPaused: "Paused"
} as const;

export function createDashboardHomeViewModel(response: DashboardHomeResponse): {
  topicCountLabel: string;
  regionLabel: string;
  deliveryTimeLabel: string;
  deliveryStateLabel: string;
  historyCount: number;
  showEmptyState: boolean;
} {
  const summary = response.preferenceSummary;
  return {
    topicCountLabel: summary ? `${summary.topics.length} topics` : "No saved topics",
    regionLabel: summary?.region ?? "Region not set",
    deliveryTimeLabel: summary?.deliveryTimeLocal ?? "Delivery time not set",
    deliveryStateLabel:
      summary?.newsletterEnabled === false ? DASHBOARD_HOME_COPY.deliveryPaused : DASHBOARD_HOME_COPY.deliveryActive,
    historyCount: response.history.length,
    showEmptyState: response.emptyHistory
  };
}

const cardStyle: React.CSSProperties = {
  background: DESIGN_TOKENS.colors.bgSecondary,
  borderRadius: 16,
  padding: DESIGN_TOKENS.spacing[2],
  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)"
};

export function DashboardHome(props: Readonly<{
  response: DashboardHomeResponse;
  onEditPreferences?: () => void;
}>): React.JSX.Element {
  const vm = createDashboardHomeViewModel(props.response);

  return (
    <section aria-label="dashboard-home" style={{ display: "grid", gap: DESIGN_TOKENS.spacing[2] }}>
      <h1 style={{ font: DESIGN_TOKENS.typography.h1 }}>{DASHBOARD_HOME_COPY.heading}</h1>

      <article style={cardStyle}>
        <h2 style={{ font: DESIGN_TOKENS.typography.h2 }}>{DASHBOARD_HOME_COPY.preferenceCardHeading}</h2>
        <p>{vm.topicCountLabel}</p>
        <p>{vm.regionLabel}</p>
        <p>{vm.deliveryTimeLabel}</p>
        <p>{vm.deliveryStateLabel}</p>
        <button type="button" onClick={props.onEditPreferences}>
          {DASHBOARD_HOME_COPY.editPreferences}
        </button>
      </article>

      <article style={cardStyle}>
        <h2 style={{ font: DESIGN_TOKENS.typography.h2 }}>{DASHBOARD_HOME_COPY.historyHeading}</h2>
        {vm.showEmptyState ? (
          <p>{DASHBOARD_HOME_COPY.emptyHistory}</p>
        ) : (
          <ul>
            {props.response.history.map((item) => (
              <li key={item.newsletterId}>
                <span>{item.date}</span> <strong>{item.status}</strong>{" "}
                {item.status === "sent" && item.viewUrl ? <a href={item.viewUrl}>View</a> : null}
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
