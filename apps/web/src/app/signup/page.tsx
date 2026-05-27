import React from "react";
import { SecureSignupWithExplicitConsentForm } from "../../features/authentication-consent/secure-signup-with-explicit-consent";
import { DESIGN_TOKENS } from "../../features/design-system/tokens";

export default function SignupPage(): JSX.Element {
  return (
    <main>
      <SecureSignupWithExplicitConsentForm />
      <p style={{ textAlign: "center", marginTop: -8, color: DESIGN_TOKENS.colors.textSecondary }}>
        Already have an account? <a href="/login" style={{ color: DESIGN_TOKENS.colors.brandPrimary }}>Sign in</a>
      </p>
    </main>
  );
}
