import { describe, expect, it, vi } from "vitest";
import {
  ExportConsentSafeListsAndReviewHealthMetricsService,
  type ExportMetricsDependencies,
  type ConsentExportRepository,
  type MetricsRepository
} from "../../../apps/api/src/features/admin-dashboard/export-consent-safe-lists-and-review-health-metrics.service";
import { AdminAuditLogService } from "../../../apps/api/src/services/adminAuditLogService";

function createConsentRepository(): ConsentExportRepository {
  return {
    async findUsersWithConsent(mode) {
      if (mode === "offers") {
        return [
          { email: "user1@dailypaper.test", offers: true, productUpdates: false, newsletter: true, signupDate: "2026-01-01" }
        ];
      }
      return [];
    }
  };
}

function createMetricsRepository(values?: { registrations?: number | null; sends?: number | null; openRate?: number | null }): MetricsRepository {
  return {
    async getTotalRegistrations() { return values && "registrations" in values ? values.registrations : 1500; },
    async getNewsletterSends() { return values && "sends" in values ? values.sends : 3200; },
    async getEstimatedOpenRate() { return values && "openRate" in values ? values.openRate : 42; }
  };
}

function createDeps(overrides?: Partial<ExportMetricsDependencies>): ExportMetricsDependencies {
  return {
    consentRepository: createConsentRepository(),
    metricsRepository: createMetricsRepository(),
    auditLog: new AdminAuditLogService(vi.fn()),
    telemetry: { track: vi.fn() },
    now: () => new Date("2026-05-26T10:00:00.000Z"),
    ...overrides
  };
}

describe("US4 unit: export consent-safe lists and review health metrics", () => {
  it("exports only users with matching consent and excludes others", async () => {
    const svc = new ExportConsentSafeListsAndReviewHealthMetricsService(createDeps());
    const result = await svc.exportConsentList({ actorUid: "admin-uid", actorRole: "admin", mode: "offers" });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].offers).toBe(true);
    expect(result.filterType).toBe("offers");
  });

  it("returns empty export when no users match consent filter", async () => {
    const svc = new ExportConsentSafeListsAndReviewHealthMetricsService(createDeps());
    const result = await svc.exportConsentList({ actorUid: "admin-uid", actorRole: "admin", mode: "productUpdates" });

    expect(result.rows).toHaveLength(0);
    expect(result.totalIncluded).toBe(0);
  });

  it("audit logs every export request with count and filter type", async () => {
    const auditSink = vi.fn();
    const svc = new ExportConsentSafeListsAndReviewHealthMetricsService(
      createDeps({ auditLog: new AdminAuditLogService(auditSink) })
    );

    await svc.exportConsentList({ actorUid: "admin-uid", actorRole: "admin", mode: "offers" });

    expect(auditSink).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: "export_consent_list", outcome: "success" })
    );
  });

  it("returns available metrics when all data sources respond", async () => {
    const svc = new ExportConsentSafeListsAndReviewHealthMetricsService(createDeps());
    const metrics = await svc.getHealthMetrics({ actorUid: "admin-uid", actorRole: "admin" });

    expect(metrics.totalRegistrations).toEqual({ available: true, value: 1500 });
    expect(metrics.newsletterSends).toEqual({ available: true, value: 3200 });
    expect(metrics.estimatedOpenRate).toEqual({ available: true, value: 42 });
  });

  it("marks metrics unavailable when upstream returns null", async () => {
    const svc = new ExportConsentSafeListsAndReviewHealthMetricsService(
      createDeps({ metricsRepository: createMetricsRepository({ registrations: null, sends: null, openRate: null }) })
    );
    const metrics = await svc.getHealthMetrics({ actorUid: "admin-uid", actorRole: "admin" });

    expect(metrics.totalRegistrations).toEqual({ available: false });
    expect(metrics.newsletterSends).toEqual({ available: false });
    expect(metrics.estimatedOpenRate).toEqual({ available: false });
  });

  it("export rows include email, consent flags, and signup date", async () => {
    const svc = new ExportConsentSafeListsAndReviewHealthMetricsService(createDeps());
    const result = await svc.exportConsentList({ actorUid: "admin-uid", actorRole: "admin", mode: "offers" });

    const row = result.rows[0];
    expect(row).toHaveProperty("email");
    expect(row).toHaveProperty("offers");
    expect(row).toHaveProperty("productUpdates");
    expect(row).toHaveProperty("newsletter");
    expect(row).toHaveProperty("signupDate");
  });
});
