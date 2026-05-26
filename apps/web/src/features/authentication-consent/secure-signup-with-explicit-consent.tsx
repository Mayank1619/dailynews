import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { DESIGN_TOKENS } from "../design-system/tokens";
import { getFirebaseClientAuth } from "../../lib/firebaseAuthClient";

export const AUTH_SIGNUP_COPY = {
  heading: "Create your Daily Paper account",
  subheading: "Use email signup and choose exactly which updates you want.",
  emailLabel: "Email",
  passwordLabel: "Password",
  newsletterLabel: "I agree to receive the Daily Paper newsletter (required)",
  productUpdatesLabel: "Send me product updates (optional)",
  offersLabel: "Send me offers and promotions (optional)",
  submitLabel: "Create account",
  successMessage: "Signup complete. Please verify your email before newsletter delivery."
} as const;

export type SecureSignupConsentForm = {
  email: string;
  password: string;
  newsletter: boolean;
  productUpdates: boolean;
  offers: boolean;
  termsVersion: string;
};

export type AuthTelemetryClient = {
  track: (eventName: string, metadata: Record<string, string | number | boolean>) => void | Promise<void>;
};

export async function submitSecureSignupWithConsent(
  form: SecureSignupConsentForm,
  telemetry?: AuthTelemetryClient
): Promise<void> {
  const credentials = await createUserWithEmailAndPassword(getFirebaseClientAuth(), form.email, form.password);
  const idToken = await credentials.user.getIdToken();

  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify({
      consent: {
        newsletter: form.newsletter,
        productUpdates: form.productUpdates,
        offers: form.offers,
        termsVersion: form.termsVersion
      }
    })
  });

  if (!response.ok) {
    const message = `Signup failed with status ${response.status}`;
    await telemetry?.track("secure_signup_failed", { status: response.status });
    throw new Error(message);
  }

  await telemetry?.track("secure_signup_submitted", {
    newsletter: form.newsletter,
    productUpdates: form.productUpdates,
    offers: form.offers,
    termsVersion: form.termsVersion
  });
}

const cardStyle: React.CSSProperties = {
  background: DESIGN_TOKENS.colors.bgSecondary,
  color: DESIGN_TOKENS.colors.textPrimary,
  borderRadius: 16,
  padding: DESIGN_TOKENS.spacing[3],
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
  maxWidth: 560,
  margin: "0 auto"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: `1px solid ${DESIGN_TOKENS.colors.textSecondary}`,
  borderRadius: 10,
  padding: "10px 12px",
  marginTop: 6,
  marginBottom: 14
};

const submitStyle: React.CSSProperties = {
  width: "100%",
  border: 0,
  borderRadius: 10,
  padding: "12px 16px",
  background: DESIGN_TOKENS.colors.brandPrimary,
  color: DESIGN_TOKENS.colors.bgSecondary,
  fontWeight: 600,
  cursor: "pointer"
};

export function SecureSignupWithExplicitConsentForm(): React.JSX.Element {
  const [form, setForm] = useState<SecureSignupConsentForm>({
    email: "",
    password: "",
    newsletter: true,
    productUpdates: false,
    offers: false,
    termsVersion: "2026.05"
  });
  const [statusMessage, setStatusMessage] = useState("");

  const setField = <K extends keyof SecureSignupConsentForm>(key: K, value: SecureSignupConsentForm[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  return (
    <section style={{ padding: DESIGN_TOKENS.spacing[3], background: DESIGN_TOKENS.colors.bgPrimary }}>
      <form
        style={cardStyle}
        onSubmit={async (event) => {
          event.preventDefault();
          setStatusMessage("");
          try {
            await submitSecureSignupWithConsent(form);
            setStatusMessage(AUTH_SIGNUP_COPY.successMessage);
          } catch (error) {
            setStatusMessage(error instanceof Error ? error.message : "Signup failed.");
          }
        }}
      >
        <h1 style={{ marginBottom: 8 }}>{AUTH_SIGNUP_COPY.heading}</h1>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary, marginTop: 0 }}>{AUTH_SIGNUP_COPY.subheading}</p>

        <label>
          {AUTH_SIGNUP_COPY.emailLabel}
          <input
            required
            type="email"
            value={form.email}
            style={inputStyle}
            onChange={(event) => setField("email", event.target.value)}
          />
        </label>

        <label>
          {AUTH_SIGNUP_COPY.passwordLabel}
          <input
            required
            type="password"
            minLength={12}
            value={form.password}
            style={inputStyle}
            onChange={(event) => setField("password", event.target.value)}
          />
        </label>

        <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
          <input
            type="checkbox"
            checked={form.newsletter}
            onChange={(event) => setField("newsletter", event.target.checked)}
          />
          <span>{AUTH_SIGNUP_COPY.newsletterLabel}</span>
        </label>

        <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
          <input
            type="checkbox"
            checked={form.productUpdates}
            onChange={(event) => setField("productUpdates", event.target.checked)}
          />
          <span>{AUTH_SIGNUP_COPY.productUpdatesLabel}</span>
        </label>

        <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18 }}>
          <input
            type="checkbox"
            checked={form.offers}
            onChange={(event) => setField("offers", event.target.checked)}
          />
          <span>{AUTH_SIGNUP_COPY.offersLabel}</span>
        </label>

        <button type="submit" style={submitStyle}>
          {AUTH_SIGNUP_COPY.submitLabel}
        </button>

        {statusMessage ? <p style={{ marginTop: 16 }}>{statusMessage}</p> : null}
      </form>
    </section>
  );
}
