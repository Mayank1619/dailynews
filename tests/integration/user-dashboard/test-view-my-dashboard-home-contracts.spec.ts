import { describe, expect, it, vi } from "vitest";
import {
  assertUidOwnership,
  type FirebaseRequestContext,
  verifyFirebaseIdToken
} from "../../../apps/api/src/middleware/firebaseAuth";
import { DashboardQueryService } from "../../../apps/api/src/features/user-dashboard/dashboardService";
import { ViewMyDashboardHomeService } from "../../../apps/api/src/features/user-dashboard/view-my-dashboard-home.service";

describe("US1 integration: view my dashboard home contracts", () => {
  it("verifies firebase bearer token and owner UID scope", async () => {
    const context: FirebaseRequestContext = {
      headers: { authorization: "Bearer token-1" }
    };

    const verified = await verifyFirebaseIdToken(context, {
      async verifyIdToken(token: string) {
        expect(token).toBe("token-1");
        return { uid: "user-1", email_verified: true };
      }
    });

    expect(assertUidOwnership(verified, "user-1").uid).toBe("user-1");
    expect(() => assertUidOwnership(verified, "user-2")).toThrow("Forbidden: UID ownership mismatch");
  });

  it("returns owner-only preferences and history", async () => {
    const query = new DashboardQueryService({
      preferenceRepository: {
        async getPreferenceSummaryByUid(uid: string) {
          return {
            userId: uid,
            topics: ["tech", "policy"],
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
              { newsletterId: "n1", userId: uid, date: "2026-05-27", status: "sent", viewUrl: "/n1" },
              { newsletterId: "n2", userId: "other-user", date: "2026-05-26", status: "sent", viewUrl: "/n2" }
            ]
          };
        }
      }
    });

    const service = new ViewMyDashboardHomeService({
      dashboardQueryService: query,
      telemetry: { track: vi.fn() }
    });

    const result = await service.getDashboardHome({
      authenticatedUid: "user-1",
      ownerUid: "user-1"
    });

    expect(result.preferenceSummary?.userId).toBe("user-1");
    expect(result.history).toHaveLength(1);
    expect(result.history[0]?.newsletterId).toBe("n1");
  });
});
