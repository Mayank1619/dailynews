import { AdminAuditLogService } from "../../services/adminAuditLogService";
import {
  createAdminDashboardTelemetryEvent,
  type AdminDashboardTelemetry
} from "./secure-admin-access-and-governance.telemetry";
import type {
  AdminHealthMetrics,
  ConsentExportRow,
  ExportConsentListCommand,
  ExportConsentListResult,
  GetHealthMetricsQuery
} from "./export-consent-safe-lists-and-review-health-metrics.types";

export type ConsentExportRepository = {
  findUsersWithConsent: (mode: "offers" | "productUpdates") => Promise<ConsentExportRow[]>;
};

export type MetricsRepository = {
  getTotalRegistrations: () => Promise<number | null>;
  getNewsletterSends: () => Promise<number | null>;
  getEstimatedOpenRate: () => Promise<number | null>;
};

export type ExportMetricsDependencies = {
  consentRepository: ConsentExportRepository;
  metricsRepository: MetricsRepository;
  auditLog: AdminAuditLogService;
  telemetry: AdminDashboardTelemetry;
  now: () => Date;
};

export class ExportConsentSafeListsAndReviewHealthMetricsService {
  constructor(private readonly deps: ExportMetricsDependencies) {}

  async exportConsentList(command: ExportConsentListCommand): Promise<ExportConsentListResult> {
    const rows = await this.deps.consentRepository.findUsersWithConsent(command.mode);

    const exportedAt = this.deps.now().toISOString();

    await this.deps.auditLog.record({
      actorUid: command.actorUid,
      actorRole: command.actorRole,
      actionType: "export_consent_list",
      targetType: "consent_export",
      targetId: command.mode,
      outcome: "success",
      reason: `filter=${command.mode} count=${rows.length}`
    });

    await this.deps.telemetry.track(
      createAdminDashboardTelemetryEvent("admin_consent_export_completed", "success", {
        actorUid: command.actorUid,
        mode: command.mode,
        recordCount: rows.length
      })
    );

    return {
      rows,
      totalIncluded: rows.length,
      filterType: command.mode,
      exportedAt
    };
  }

  async getHealthMetrics(query: GetHealthMetricsQuery): Promise<AdminHealthMetrics> {
    const [registrations, sends, openRate] = await Promise.all([
      this.deps.metricsRepository.getTotalRegistrations(),
      this.deps.metricsRepository.getNewsletterSends(),
      this.deps.metricsRepository.getEstimatedOpenRate()
    ]);

    await this.deps.telemetry.track(
      createAdminDashboardTelemetryEvent("admin_health_metrics_viewed", "success", {
        actorUid: query.actorUid
      })
    );

    return {
      totalRegistrations: registrations !== null
        ? { available: true, value: registrations }
        : { available: false },
      newsletterSends: sends !== null
        ? { available: true, value: sends }
        : { available: false },
      estimatedOpenRate: openRate !== null
        ? { available: true, value: openRate }
        : { available: false }
    };
  }
}
