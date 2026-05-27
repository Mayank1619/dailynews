import { describe, expect, it, vi } from "vitest";
import { PauseOrResumeNewsletterDeliveryService } from "../../../apps/api/src/features/user-dashboard/pause-or-resume-newsletter-delivery.service";

describe("US3 integration: pause or resume newsletter delivery contracts", () => {
  it("pauses newsletter delivery by setting newsletterEnabled=false", async () => {
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
      telemetry: { track: vi.fn() }
    });

    const result = await service.toggleDeliveryState({
      authenticatedUid: "u1",
      ownerUid: "u1",
      source: "dashboard",
      pause: true
    });

    expect(result.state).toBe("paused");
    expect(result.summary.newsletterEnabled).toBe(false);
  });

  it("resumes newsletter delivery by setting newsletterEnabled=true", async () => {
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
      telemetry: { track: vi.fn() }
    });

    const result = await service.toggleDeliveryState({
      authenticatedUid: "u1",
      ownerUid: "u1",
      source: "dashboard",
      pause: false
    });

    expect(result.state).toBe("active");
    expect(result.summary.newsletterEnabled).toBe(true);
  });
});
