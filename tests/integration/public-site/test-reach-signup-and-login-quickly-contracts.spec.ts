import { describe, expect, it } from "vitest";
import { ReachSignupAndLoginQuicklyService } from "../../../apps/api/src/features/public-site/reach-signup-and-login-quickly.service";
import { PUBLIC_NAV_ACTIONS } from "../../../apps/web/src/features/public-site/contracts";

describe("US2 integration: reach signup and login quickly contracts", () => {
  it("keeps one-click public transitions for signup, login, and blog", () => {
    const service = new ReachSignupAndLoginQuicklyService();
    const routes = service.getActionRoutes();

    expect(routes.primary.route).toBe("/signup");
    expect(routes.login.route).toBe("/login");
    expect(routes.blog.route).toBe("/blog");
    expect(PUBLIC_NAV_ACTIONS.find((action) => action.route === "/signup")?.label).toBe("Get Your Daily Paper");
  });
});
