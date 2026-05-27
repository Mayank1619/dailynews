export type ConsentExportMode = "offers" | "productUpdates";

export type ConsentExportRow = {
  email: string;
  offers: boolean;
  productUpdates: boolean;
  newsletter: boolean;
  signupDate: string;
};

export type ExportConsentListCommand = {
  actorUid: string;
  actorRole: string;
  mode: ConsentExportMode;
};

export type ExportConsentListResult = {
  rows: ConsentExportRow[];
  totalIncluded: number;
  filterType: ConsentExportMode;
  exportedAt: string;
};

export type MetricValue =
  | { available: true; value: number }
  | { available: false };

export type AdminHealthMetrics = {
  totalRegistrations: MetricValue;
  newsletterSends: MetricValue;
  estimatedOpenRate: MetricValue;
};

export type GetHealthMetricsQuery = {
  actorUid: string;
  actorRole: string;
};
