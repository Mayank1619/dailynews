import { describe, expect, it, vi } from "vitest";
import { PauseOrResumeNewsletterDeliveryService } from "../../../apps/api/src/features/user-dashboard/pause-or-resume-newsletter-delivery.service";
import {
  getDeliveryStateLabel,
  getDeliveryToggleLabel
} from "../../../apps/web/src/features/user-dashboard/pause-or-resume-newsletter-delivery";

describe("US3 unit: pause or resume newsletter delivery", () => {
  it("returns pause label while active and resume label while paused", () => {
    expect(getDeliveryToggleLabel(true)).toBe("Pause Newsletter");
    expect(getDeliveryToggleLabel(false)).toBe("Resume Newsletter");
    expect(getDeliveryStateLabel(true)).toBe("Active");
    expect(getDeliveryStateLabel(false)).toBe("Paused");
  });

  it("tracks newsletter.paused and newsletter.resumed", async () => {
    const track = vi.fn();
    const service = new PauseOrResumeNewsletterDeliveryService({
      dashboardQueryService: {
        async updateDeliveryState(_authUid: string, ownerUid: string, newsletterEnabled: boolean) {
          return {
            userId: ownerUid,
            topics: ["tech"],
            region: "US",
            deliveryTimeLocal: "08:00",
            newsletterEnabled,
            updatedAt: "2026-05-27T00:00:00.000Z"
          };
        }
      },
      telemetry: { track }
    });

    await service.toggleDeliveryState({ authenticatedUid: "u1", ownerUid: "u1", source: "dashboard", pause: true });
    await service.toggleDeliveryState({ authenticatedUid: "u1", ownerUid: "u1", source: "dashboard", pause: false });

    const names = track.mock.calls.map((c: unknown[]) => (c[0] as { eventName: string }).eventName);
    expect(names).toContain("newsletter.paused");
    expect(names).toContain("newsletter.resumed");
  });

  it("does not leak PII in telemetry payload", async () => {
    const track = vi.fn();
    const service = new PauseOrResumeNewsletterDeliveryService({
      dashboardQueryService: {
        async updateDeliveryState(_authUid: string, ownerUid: string, newsletterEnabled: boolean) {
          return {
            userId: ownerUid,
            topics: [],
            region: "US",
            deliveryTimeLocal: "08:00",
            newsletterEnabled,
            updatedAt: "2026-05-27T00:00:00.000Z"
          };
        }
      },
      telemetry: { track }
    });

    await service.toggleDeliveryState({ authenticatedUid: "u1", ownerUid: "u1", source: "dashboard", pause: true });
    expect(JSON.stringify(track.mock.calls)).not.toContain("@");
  });
});
