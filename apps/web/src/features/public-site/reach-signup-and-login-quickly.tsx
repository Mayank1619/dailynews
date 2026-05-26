import React from "react";
import { ReachSignupAndLoginQuicklyService } from "../../../../api/src/features/public-site/reach-signup-and-login-quickly.service";

const service = new ReachSignupAndLoginQuicklyService();

type ReachSignupAndLoginQuicklyActionsProps = Readonly<{
  includePrimary?: boolean;
}>;

export function ReachSignupAndLoginQuicklyActions({ includePrimary = false }: ReachSignupAndLoginQuicklyActionsProps): React.JSX.Element {
  const routes = service.getActionRoutes();
  const actions = includePrimary ? [routes.primary, routes.login, routes.blog] : [routes.login, routes.blog];

  return (
    <nav aria-label="public quick actions" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {actions.map((action) => (
        <a key={action.route} href={action.route}>
          {action.label}
        </a>
      ))}
    </nav>
  );
}
