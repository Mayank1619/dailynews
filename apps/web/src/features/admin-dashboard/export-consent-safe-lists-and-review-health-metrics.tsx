import React from "react";
import { DESIGN_TOKENS } from "../design-system/tokens";

export const EXPORT_METRICS_COPY = {
  metricsHeading: "Health Metrics",
  exportHeading: "Consent-Safe Export",
  exportOffersLabel: "Export (Offers consent)",
  exportProductUpdatesLabel: "Export (Product Updates consent)",
  unavailableLabel: "Unavailable",
  downloadCsvLabel: "Download CSV",
  emptyExport: "No users matched the consent filter."
} as const;

export type MetricDisplayValue =
  | { available: true; value: number }
  | { available: false };

export type AdminMetricsDisplay = {
  totalRegistrations: MetricDisplayValue;
  newsletterSends: MetricDisplayValue;
  estimatedOpenRate: MetricDisplayValue;
};

export type ExportRow = {
  email: string;
  offers: boolean;
  productUpdates: boolean;
  newsletter: boolean;
  signupDate: string;
};

const containerStyle: React.CSSProperties = { padding: 24 };
const sectionStyle: React.CSSProperties = { marginBottom: 40 };
const cardGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: 16
};
const metricCardStyle: React.CSSProperties = {
  background: DESIGN_TOKENS.colors.bgSecondary,
  borderRadius: 10,
  padding: 20,
  boxShadow: "0 2px 8px rgba(15,23,42,0.06)"
};
const metricValueStyle: React.CSSProperties = {
  fontSize: 36,
  fontWeight: 700,
  color: DESIGN_TOKENS.colors.brandPrimary
};
const metricLabelStyle: React.CSSProperties = {
  fontSize: 13,
  color: DESIGN_TOKENS.colors.textSecondary,
  marginTop: 4
};
const btnStyle = (color = DESIGN_TOKENS.colors.brandPrimary): React.CSSProperties => ({
  border: 0,
  borderRadius: 8,
  padding: "10px 20px",
  background: color,
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  marginRight: 12
});

function MetricCard({ label, value }: { label: string; value: MetricDisplayValue }) {
  return (
    <div style={metricCardStyle}>
      <div style={metricValueStyle}>
        {value.available ? value.value.toLocaleString() : (
          <span style={{ fontSize: 18, color: DESIGN_TOKENS.colors.textSecondary }}>
            {EXPORT_METRICS_COPY.unavailableLabel}
          </span>
        )}
      </div>
      <div style={metricLabelStyle}>{label}</div>
    </div>
  );
}

function exportToCsv(rows: ExportRow[], filename: string) {
  const header = "email,offers,productUpdates,newsletter,signupDate";
  const lines = rows.map(
    (r) => `${r.email},${r.offers},${r.productUpdates},${r.newsletter},${r.signupDate}`
  );
  const csv = [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportConsentSafeListsAndReviewHealthMetrics({
  metrics,
  onRequestExport
}: {
  metrics: AdminMetricsDisplay;
  onRequestExport: (mode: "offers" | "productUpdates") => Promise<ExportRow[]>;
}): React.JSX.Element {
  const [exportRows, setExportRows] = React.useState<ExportRow[] | null>(null);
  const [exporting, setExporting] = React.useState(false);

  async function handleExport(mode: "offers" | "productUpdates") {
    setExporting(true);
    try {
      const rows = await onRequestExport(mode);
      setExportRows(rows);
      if (rows.length > 0) {
        exportToCsv(rows, `consent-export-${mode}-${new Date().toISOString().slice(0, 10)}.csv`);
      }
    } finally {
      setExporting(false);
    }
  }

  return (
    <div style={containerStyle}>
      {/* Metrics */}
      <section style={sectionStyle}>
        <h2 style={{ color: DESIGN_TOKENS.colors.textPrimary, marginBottom: 16 }}>
          {EXPORT_METRICS_COPY.metricsHeading}
        </h2>
        <div style={cardGridStyle}>
          <MetricCard label="Registrations" value={metrics.totalRegistrations} />
          <MetricCard label="Newsletter Sends" value={metrics.newsletterSends} />
          <MetricCard label="Est. Open Rate (%)" value={metrics.estimatedOpenRate} />
        </div>
      </section>

      {/* Exports */}
      <section>
        <h2 style={{ color: DESIGN_TOKENS.colors.textPrimary, marginBottom: 16 }}>
          {EXPORT_METRICS_COPY.exportHeading}
        </h2>
        <button
          style={btnStyle()}
          disabled={exporting}
          onClick={() => handleExport("offers")}
          aria-label="Export users with offers consent"
        >
          {EXPORT_METRICS_COPY.exportOffersLabel}
        </button>
        <button
          style={btnStyle(DESIGN_TOKENS.colors.brandSecondary)}
          disabled={exporting}
          onClick={() => handleExport("productUpdates")}
          aria-label="Export users with product updates consent"
        >
          {EXPORT_METRICS_COPY.exportProductUpdatesLabel}
        </button>

        {exportRows !== null && exportRows.length === 0 && (
          <p style={{ color: DESIGN_TOKENS.colors.textSecondary, marginTop: 16 }}>
            {EXPORT_METRICS_COPY.emptyExport}
          </p>
        )}
        {exportRows !== null && exportRows.length > 0 && (
          <p style={{ color: DESIGN_TOKENS.colors.success, marginTop: 16 }}>
            {exportRows.length} record(s) exported.
          </p>
        )}
      </section>
    </div>
  );
}
