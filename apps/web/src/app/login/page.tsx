import React from "react";
import { LoginForm } from "../../features/authentication-consent/login-logout-and-password-recovery";
import { DESIGN_TOKENS } from "../../features/design-system/tokens";

export default function LoginPage(): JSX.Element {
  return (
    <main style={{ padding: DESIGN_TOKENS.spacing[3], background: DESIGN_TOKENS.colors.bgPrimary, minHeight: "100vh" }}>
      <LoginForm />
      <p style={{ textAlign: "center", marginTop: DESIGN_TOKENS.spacing[1], color: DESIGN_TOKENS.colors.textSecondary }}>
        New here? <a href="/signup" style={{ color: DESIGN_TOKENS.colors.brandPrimary }}>Create an account</a>
      </p>
    </main>
  );
}
