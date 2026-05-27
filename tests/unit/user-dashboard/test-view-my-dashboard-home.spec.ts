import { describe, expect, it, vi } from "vitest";
import { DashboardQueryService } from "../../../apps/api/src/features/user-dashboard/dashboardService";
import { ViewMyDashboardHomeService } from "../../../apps/api/src/features/user-dashboard/view-my-dashboard-home.service";
import { createDashboardHomeViewModel } from "../../../apps/web/src/features/user-dashboard/view-my-dashboard-home";

describe("US1 unit: view my dashboard home", () => {
  it("returns emptyHistory=true when no rows exist", async () => {
    const query = new DashboardQueryService({
      preferenceRepository: {
        async getPreferenceSummaryByUid(uid: string) {
          return {
            userId: uid,
            topics: [],
            region: "US",
            deliveryTimeLocal: "09:00",
            newsletterEnabled: true,
            updatedAt: "2026-05-27T00:00:00.000Z"
          };
        },
        async updateNewsletterEnabled() {
          throw new Error("not used");
        }
      },
      historyRepository: {
        async getHistoryByUid() {
          return { items: [] };
        }
      }
    });

    const service = new ViewMyDashboardHomeService({
      dashboardQueryService: query,
      telemetry: { track: vi.fn() }
    });

    const result = await service.getDashboardHome({ authenticatedUid: "u1", ownerUid: "u1" });
    expect(result.emptyHistory).toBe(true);
  });

  it("creates a UI view model with paused state when newsletterEnabled=false", () => {
    const vm = createDashboardHomeViewModel({
      preferenceSummary: {
        topics: ["tech"],
        region: "US",
        deliveryTimeLocal: "08:00",
        newsletterEnabled: false
      },
      history: [],
      emptyHistory: true
    });

    expect(vm.deliveryStateLabel).toBe("Paused");
    expect(vm.showEmptyState).toBe(true);
  });

  it("tracks dashboard.viewed event", async () => {
    const track = vi.fn();
    const query = new DashboardQueryService({
      preferenceRepository: {
        async getPreferenceSummaryByUid(uid: string) {
          return {
            userId: uid,
            topics: ["science"],
            region: "CA",
            deliveryTimeLocal: "07:00",
            newsletterEnabled: true,
            updatedAt: "2026-05-27T00:00:00.000Z"
          };
        },
        async updateNewsletterEnabled() {
          throw new Error("not used");
        }
      },
      historyRepository: {
        async getHistoryByUid(uid: string) {
          return { items: [{ newsletterId: "n1", userId: uid, date: "2026-05-27", status: "sent" }] };
        }
      }
    });

    const service = new ViewMyDashboardHomeService({
      dashboardQueryService: query,
      telemetry: { track }
    });

    await service.getDashboardHome({ authenticatedUid: "u1", ownerUid: "u1" });
    const names = track.mock.calls.map((c: unknown[]) => (c[0] as { eventName: string }).eventName);
    expect(names).toContain("dashboard.viewed");
  });
});
