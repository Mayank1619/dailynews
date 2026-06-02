import React from "react";
import { LoginForm } from "../../features/authentication-consent/login-logout-and-password-recovery";
import { DESIGN_TOKENS } from "../../features/design-system/tokens";

export default function LoginPage(): JSX.Element {
  return (
    <main
      style={{
        padding: DESIGN_TOKENS.spacing[3],
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
        alignItems: "center",
        gap: DESIGN_TOKENS.spacing[3],
        background:
          "radial-gradient(circle at 10% 0%, rgba(34,211,238,0.24), transparent 34%), radial-gradient(circle at 90% 8%, rgba(168,85,247,0.22), transparent 34%), #070912",
        minHeight: "100vh"
      }}
    >
      <section style={{ maxWidth: 560 }}>
        <p style={{ color: DESIGN_TOKENS.colors.brandPrimary, fontWeight: 800, margin: 0 }}>Daily Paper</p>
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, margin: "8px 0 12px" }}>Welcome back to your paper.</h1>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary, maxWidth: 520 }}>
          Sign in to adjust topics, change frequency, pause delivery, or tune the prompt that shapes your newsletter.
        </p>
        <p style={{ marginTop: DESIGN_TOKENS.spacing[2], color: DESIGN_TOKENS.colors.textSecondary }}>
          Powered by{" "}
          <a href="https://netfruit.com" style={{ color: DESIGN_TOKENS.colors.brandPrimary, fontWeight: 800 }}>
            Netfruit
          </a>
        </p>
      </section>
      <section>
        <LoginForm />
      </section>
    </main>
  );
}
