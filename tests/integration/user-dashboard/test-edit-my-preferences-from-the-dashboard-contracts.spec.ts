import { describe, expect, it, vi } from "vitest";
import { EditMyPreferencesFromDashboardService } from "../../../apps/api/src/features/user-dashboard/edit-my-preferences-from-the-dashboard.service";

describe("US2 integration: edit my preferences from dashboard contracts", () => {
  it("returns preferences editor path for owner", async () => {
    const service = new EditMyPreferencesFromDashboardService({
      preferenceRepository: {
        async getPreferenceSummaryByUid(uid: string) {
          return {
            userId: uid,
            topics: ["business"],
            region: "IN",
            deliveryTimeLocal: "10:00",
            newsletterEnabled: true,
            updatedAt: "2026-05-27T00:00:00.000Z"
          };
        }
      },
      telemetry: { track: vi.fn() },
      preferencesEditorPath: "/preferences/edit"
    });

    const result = await service.getEditorRedirect({
      authenticatedUid: "u2",
      ownerUid: "u2",
      source: "dashboard"
    });

    expect(result.editorPath).toBe("/preferences/edit");
    expect(result.summary?.userId).toBe("u2");
  });

  it("rejects cross-user access", async () => {
    const service = new EditMyPreferencesFromDashboardService({
      preferenceRepository: { async getPreferenceSummaryByUid() { return null; } },
      telemetry: { track: vi.fn() },
      preferencesEditorPath: "/preferences/edit"
    });

    await expect(
      service.getEditorRedirect({ authenticatedUid: "u2", ownerUid: "u3", source: "dashboard" })
    ).rejects.toThrow("Forbidden: UID ownership mismatch");
  });
});
