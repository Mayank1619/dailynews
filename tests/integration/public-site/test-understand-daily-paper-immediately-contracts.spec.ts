import { describe, expect, it } from "vitest";
import { PublicSiteLandingService } from "../../../apps/api/src/features/public-site/understand-daily-paper-immediately.service";
import {
  LANDING_ROUTE,
  PRIMARY_CTA,
  PUBLIC_NAV_ACTIONS
} from "../../../apps/web/src/features/public-site/contracts";

describe("US1 integration: understand Daily Paper immediately contracts", () => {
  it("aligns landing hero data with core route and CTA contracts", () => {
    const service = new PublicSiteLandingService();
    const hero = service.buildHeroContent();

    expect(LANDING_ROUTE).toBe("/");
    expect(hero.brand).toBe("Daily Paper");
    expect(hero.primaryCta.label).toBe(PRIMARY_CTA.label);
    expect(hero.primaryCta.route).toBe(PRIMARY_CTA.route);
    expect(PUBLIC_NAV_ACTIONS.map((action) => action.route)).toEqual([
      "/signup",
      "/login",
      "/about",
      "/how-it-works",
      "/pricing",
      "/blog",
      "/samples"
    ]);
  });
});
