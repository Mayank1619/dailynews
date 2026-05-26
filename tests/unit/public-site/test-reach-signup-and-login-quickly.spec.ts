import { describe, expect, it } from "vitest";
import { ReachSignupAndLoginQuicklyService } from "../../../apps/api/src/features/public-site/reach-signup-and-login-quickly.service";

describe("US2 unit: reach signup and login quickly", () => {
  it("returns deterministic route actions for public entry", () => {
    const service = new ReachSignupAndLoginQuicklyService();
    const routes = service.getActionRoutes();

    expect(routes.primary.label).toBe("Get Your Daily Paper");
    expect(routes.login.label).toBe("Login");
    expect(routes.blog.label).toBe("Blog");
  });
});
