import { describe, expect, it } from "vitest";
import { DashboardQueryService } from "../../../apps/api/src/features/user-dashboard/dashboardService";

describe("US4 integration: view and access past newsletters contracts", () => {
  it("returns reverse-chronological, owner-scoped history", async () => {
    const service = new DashboardQueryService({
      preferenceRepository: {
        async getPreferenceSummaryByUid(uid: string) {
          return {
            userId: uid,
            topics: ["world"],
            region: "US",
            deliveryTimeLocal: "08:00",
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
          return {
            items: [
              { newsletterId: "a", userId: uid, date: "2026-05-01", status: "failed" },
              { newsletterId: "b", userId: uid, date: "2026-05-03", status: "sent", viewUrl: "/b" },
              { newsletterId: "x", userId: "other", date: "2026-05-05", status: "sent", viewUrl: "/x" }
            ]
          };
        }
      }
    });

    const result = await service.getDashboardView("u1", "u1", { limit: 30 });
    expect(result.history.map((h) => h.newsletterId)).toEqual(["b", "a"]);
    expect(result.history.find((h) => h.newsletterId === "b")?.viewUrl).toBe("/b");
  });
});
