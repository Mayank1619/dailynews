import React from "react";
import { ReachSignupAndLoginQuicklyService } from "../../../../api/src/features/public-site/reach-signup-and-login-quickly.service";
import { DESIGN_TOKENS } from "../design-system/tokens";

const service = new ReachSignupAndLoginQuicklyService();

type ReachSignupAndLoginQuicklyActionsProps = Readonly<{
  includePrimary?: boolean;
}>;

export function ReachSignupAndLoginQuicklyActions({ includePrimary = false }: ReachSignupAndLoginQuicklyActionsProps): React.JSX.Element {
  const routes = service.getActionRoutes();
  const actions = includePrimary ? [routes.primary, routes.login] : [routes.login];

  return (
    <nav aria-label="public quick actions" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {actions.map((action) => (
        <a
          key={action.route}
          href={action.route}
          style={{
            color: DESIGN_TOKENS.colors.textPrimary,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: 0
          }}
        >
          {action.label}
        </a>
      ))}
    </nav>
  );
}
