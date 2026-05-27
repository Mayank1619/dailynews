import type { ReachSignupAndLoginQuicklyRoutes } from "./reach-signup-and-login-quickly.types";

export class ReachSignupAndLoginQuicklyService {
  getActionRoutes(): ReachSignupAndLoginQuicklyRoutes {
    return {
      primary: { label: "Register", route: "/signup" },
      login: { label: "Login", route: "/login" },
      blog: { label: "Blog", route: "/blog" }
    };
  }
}
