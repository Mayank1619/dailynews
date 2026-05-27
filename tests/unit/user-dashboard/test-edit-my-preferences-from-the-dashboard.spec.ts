import { describe, expect, it, vi } from "vitest";
import { EditMyPreferencesFromDashboardService } from "../../../apps/api/src/features/user-dashboard/edit-my-preferences-from-the-dashboard.service";
import { getEditPreferencesHref } from "../../../apps/web/src/features/user-dashboard/edit-my-preferences-from-the-dashboard";

describe("US2 unit: edit my preferences from dashboard", () => {
  it("returns expected editor href helper", () => {
    expect(getEditPreferencesHref()).toBe("/preferences/edit?source=dashboard");
  });

  it("tracks preferences.edit_link_clicked event", async () => {
    const track = vi.fn();
    const service = new EditMyPreferencesFromDashboardService({
      preferenceRepository: {
        async getPreferenceSummaryByUid(uid: string) {
          return {
            userId: uid,
            topics: ["sports"],
            region: "US",
            deliveryTimeLocal: "07:00",
            newsletterEnabled: true,
            updatedAt: "2026-05-27T00:00:00.000Z"
          };
        }
      },
      telemetry: { track },
      preferencesEditorPath: "/preferences/edit"
    });

    await service.getEditorRedirect({ authenticatedUid: "u1", ownerUid: "u1", source: "dashboard" });
    const names = track.mock.calls.map((c: unknown[]) => (c[0] as { eventName: string }).eventName);
    expect(names).toContain("preferences.edit_link_clicked");
  });

  it("does not leak email addresses in telemetry payload", async () => {
    const track = vi.fn();
    const service = new EditMyPreferencesFromDashboardService({
      preferenceRepository: { async getPreferenceSummaryByUid() { return null; } },
      telemetry: { track },
      preferencesEditorPath: "/preferences/edit"
    });

    await service.getEditorRedirect({
      authenticatedUid: "u1",
      ownerUid: "u1",
      source: "dashboard"
    });

    expect(JSON.stringify(track.mock.calls)).not.toContain("@");
  });
});
