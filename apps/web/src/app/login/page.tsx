import React from "react";
import { LoginForm } from "../../features/authentication-consent/login-logout-and-password-recovery";
import { DESIGN_TOKENS } from "../../features/design-system/tokens";

export default function LoginPage(): JSX.Element {
  return (
    <main
      style={{
        padding: DESIGN_TOKENS.spacing[3],
        background:
          "radial-gradient(circle at 10% 0%, rgba(34,211,238,0.24), transparent 34%), radial-gradient(circle at 90% 8%, rgba(168,85,247,0.22), transparent 34%), #070912",
        minHeight: "100vh"
      }}
    >
      <LoginForm />
      <p style={{ textAlign: "center", marginTop: DESIGN_TOKENS.spacing[1], color: DESIGN_TOKENS.colors.textSecondary }}>
        New here? <a href="/signup" style={{ color: DESIGN_TOKENS.colors.brandPrimary }}>Create an account</a>
      </p>
    </main>
  );
}
