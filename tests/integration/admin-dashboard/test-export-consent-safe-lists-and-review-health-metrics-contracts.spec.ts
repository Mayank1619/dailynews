import { describe, expect, it, vi } from "vitest";
import {
  ExportConsentSafeListsAndReviewHealthMetricsService
} from "../../../apps/api/src/features/admin-dashboard/export-consent-safe-lists-and-review-health-metrics.service";
import { AdminAuditLogService } from "../../../apps/api/src/services/adminAuditLogService";

describe("US4 integration: export consent-safe lists and review health metrics contracts", () => {
  it("export contract: only includes users matching specified consent mode", async () => {
    const svc = new ExportConsentSafeListsAndReviewHealthMetricsService({
      consentRepository: {
        async findUsersWithConsent(mode) {
          if (mode === "offers") {
            return [
              { email: "opt@test.com", offers: true, productUpdates: false, newsletter: true, signupDate: "2026-01-01" }
            ];
          }
          return [];
        }
      },
      metricsRepository: {
        async getTotalRegistrations() { return 500; },
        async getNewsletterSends() { return 1200; },
        async getEstimatedOpenRate() { return 38; }
      },
      auditLog: new AdminAuditLogService(vi.fn()),
      telemetry: { track: vi.fn() },
      now: () => new Date("2026-05-26T10:00:00.000Z")
    });

    const result = await svc.exportConsentList({ actorUid: "admin-uid", actorRole: "admin", mode: "offers" });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].email).toBe("opt@test.com");
    expect(result.rows[0].offers).toBe(true);
  });

  it("export contract: output includes required CSV columns per spec", async () => {
    const svc = new ExportConsentSafeListsAndReviewHealthMetricsService({
      consentRepository: {
        async findUsersWithConsent() {
          return [{ email: "a@test.com", offers: true, productUpdates: true, newsletter: true, signupDate: "2026-02-01" }];
        }
      },
      metricsRepository: { async getTotalRegistrations() { return 0; }, async getNewsletterSends() { return 0; }, async getEstimatedOpenRate() { return 0; } },
      auditLog: new AdminAuditLogService(vi.fn()),
      telemetry: { track: vi.fn() },
      now: () => new Date("2026-05-26T10:00:00.000Z")
    });

    const result = await svc.exportConsentList({ actorUid: "admin-uid", actorRole: "admin", mode: "productUpdates" });
    const row = result.rows[0];

    // Validate contractual fields are present
    expect(Object.keys(row)).toEqual(expect.arrayContaining(["email", "offers", "productUpdates", "newsletter", "signupDate"]));
  });

  it("metrics contract: returns structured available/unavailable per metric", async () => {
    const svc = new ExportConsentSafeListsAndReviewHealthMetricsService({
      consentRepository: { async findUsersWithConsent() { return []; } },
      metricsRepository: {
        async getTotalRegistrations() { return null; },
        async getNewsletterSends() { return 800; },
        async getEstimatedOpenRate() { return null; }
      },
      auditLog: new AdminAuditLogService(vi.fn()),
      telemetry: { track: vi.fn() },
      now: () => new Date()
    });

    const metrics = await svc.getHealthMetrics({ actorUid: "admin-uid", actorRole: "admin" });

    expect(metrics.totalRegistrations.available).toBe(false);
    expect(metrics.newsletterSends).toEqual({ available: true, value: 800 });
    expect(metrics.estimatedOpenRate.available).toBe(false);
  });

  it("audit log is written for every export request", async () => {
    const auditSink = vi.fn();
    const svc = new ExportConsentSafeListsAndReviewHealthMetricsService({
      consentRepository: { async findUsersWithConsent() { return []; } },
      metricsRepository: { async getTotalRegistrations() { return 0; }, async getNewsletterSends() { return 0; }, async getEstimatedOpenRate() { return 0; } },
      auditLog: new AdminAuditLogService(auditSink),
      telemetry: { track: vi.fn() },
      now: () => new Date()
    });

    await svc.exportConsentList({ actorUid: "admin-uid", actorRole: "admin", mode: "productUpdates" });

    expect(auditSink).toHaveBeenCalledOnce();
    expect(auditSink).toHaveBeenCalledWith(expect.objectContaining({ actionType: "export_consent_list" }));
  });
});
