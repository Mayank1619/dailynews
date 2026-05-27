import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { DESIGN_TOKENS } from "../design-system/tokens";
import { getFirebaseClientAuth } from "../../lib/firebaseAuthClient";

export const AUTH_LOGIN_COPY = {
  heading: "Sign in to Daily Paper",
  emailLabel: "Email",
  passwordLabel: "Password",
  submitLabel: "Sign in",
  forgotPasswordLink: "Forgot password?",
  successMessage: "You are now signed in."
} as const;

export const AUTH_FORGOT_PASSWORD_COPY = {
  heading: "Reset your password",
  emailLabel: "Email",
  submitLabel: "Send reset link",
  confirmationMessage:
    "If an account exists for this email, a password reset link has been sent. Please check your inbox."
} as const;

export type LoginForm = {
  email: string;
  password: string;
};

export type AuthTelemetryClient = {
  track: (eventName: string, metadata: Record<string, string | number | boolean>) => void | Promise<void>;
};

export async function submitLogin(form: LoginForm, telemetry?: AuthTelemetryClient): Promise<string> {
  const credentials = await signInWithEmailAndPassword(getFirebaseClientAuth(), form.email, form.password);
  const idToken = await credentials.user.getIdToken();
  await telemetry?.track("login_submitted", { emailVerified: credentials.user.emailVerified });
  return idToken;
}

export async function submitLogout(telemetry?: AuthTelemetryClient): Promise<void> {
  await signOut(getFirebaseClientAuth());
  await telemetry?.track("logout_submitted", {});
}

export async function submitForgotPassword(email: string, telemetry?: AuthTelemetryClient): Promise<void> {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  // Non-enumeration: ignore response body; always show same confirmation
  await telemetry?.track("forgot_password_submitted", { status: response.status });
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: DESIGN_TOKENS.colors.bgSecondary,
  color: DESIGN_TOKENS.colors.textPrimary,
  borderRadius: 16,
  padding: DESIGN_TOKENS.spacing[3],
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
  maxWidth: 480,
  margin: "0 auto"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: `1px solid ${DESIGN_TOKENS.colors.textSecondary}`,
  borderRadius: 10,
  padding: "10px 12px",
  marginTop: 6,
  marginBottom: 14,
  font: DESIGN_TOKENS.typography.body
};

const submitStyle: React.CSSProperties = {
  width: "100%",
  border: 0,
  borderRadius: 10,
  padding: "12px 16px",
  background: DESIGN_TOKENS.colors.brandPrimary,
  color: DESIGN_TOKENS.colors.bgSecondary,
  fontWeight: 600,
  cursor: "pointer",
  transition: `transform ${DESIGN_TOKENS.interaction.transitionMs}ms`
};

const linkStyle: React.CSSProperties = {
  color: DESIGN_TOKENS.colors.brandPrimary,
  background: "none",
  border: "none",
  cursor: "pointer",
  textDecoration: "underline",
  marginTop: 8,
  display: "inline-block"
};

const successStyle: React.CSSProperties = {
  color: DESIGN_TOKENS.colors.success,
  marginTop: 12
};

const errorStyle: React.CSSProperties = {
  color: DESIGN_TOKENS.colors.error,
  marginTop: 8
};

// ─── Login Form ──────────────────────────────────────────────────────────────

type LoginFormState = LoginForm & { view: "login" | "forgot" };

export function LoginForm(props: { telemetry?: AuthTelemetryClient }): React.JSX.Element {
  const [formState, setFormState] = useState<LoginFormState>({
    email: "",
    password: "",
    view: "login"
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (formState.view === "forgot") {
    return (
      <ForgotPasswordForm
        initialEmail={formState.email}
        telemetry={props.telemetry}
        onBack={() => setFormState((s) => ({ ...s, view: "login" }))}
      />
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      await submitLogin({ email: formState.email, password: formState.password }, props.telemetry);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Login failed. Please try again.");
    }
  }

  return (
    <div style={cardStyle}>
      <h1 style={{ font: DESIGN_TOKENS.typography.h2, marginBottom: DESIGN_TOKENS.spacing[1] }}>
        {AUTH_LOGIN_COPY.heading}
      </h1>
      <form onSubmit={(e) => void handleSubmit(e)} noValidate>
        <label htmlFor="login-email" style={{ font: DESIGN_TOKENS.typography.body }}>
          {AUTH_LOGIN_COPY.emailLabel}
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          style={inputStyle}
          value={formState.email}
          onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
        />
        <label htmlFor="login-password" style={{ font: DESIGN_TOKENS.typography.body }}>
          {AUTH_LOGIN_COPY.passwordLabel}
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          style={inputStyle}
          value={formState.password}
          onChange={(e) => setFormState((s) => ({ ...s, password: e.target.value }))}
        />
        <button type="submit" style={submitStyle} disabled={status === "loading"}>
          {status === "loading" ? "Signing in…" : AUTH_LOGIN_COPY.submitLabel}
        </button>
        <button
          type="button"
          style={linkStyle}
          onClick={() => setFormState((s) => ({ ...s, view: "forgot" }))}
        >
          {AUTH_LOGIN_COPY.forgotPasswordLink}
        </button>
        {status === "success" && <p style={successStyle}>{AUTH_LOGIN_COPY.successMessage}</p>}
        {status === "error" && <p style={errorStyle}>{errorMessage}</p>}
      </form>
    </div>
  );
}

// ─── Forgot Password Form ────────────────────────────────────────────────────

type ForgotPasswordFormProps = {
  initialEmail?: string;
  onBack?: () => void;
  telemetry?: AuthTelemetryClient;
};

export function ForgotPasswordForm(props: ForgotPasswordFormProps): React.JSX.Element {
  const [email, setEmail] = useState(props.initialEmail ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    try {
      await submitForgotPassword(email, props.telemetry);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }

  return (
    <div style={cardStyle}>
      <h2 style={{ font: DESIGN_TOKENS.typography.h2, marginBottom: DESIGN_TOKENS.spacing[1] }}>
        {AUTH_FORGOT_PASSWORD_COPY.heading}
      </h2>
      {submitted ? (
        <p style={successStyle}>{AUTH_FORGOT_PASSWORD_COPY.confirmationMessage}</p>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <label htmlFor="fp-email" style={{ font: DESIGN_TOKENS.typography.body }}>
            {AUTH_FORGOT_PASSWORD_COPY.emailLabel}
          </label>
          <input
            id="fp-email"
            type="email"
            autoComplete="email"
            required
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" style={submitStyle} disabled={loading}>
            {loading ? "Sending…" : AUTH_FORGOT_PASSWORD_COPY.submitLabel}
          </button>
        </form>
      )}
      {props.onBack && (
        <button type="button" style={linkStyle} onClick={props.onBack}>
          ← Back to sign in
        </button>
      )}
    </div>
  );
}
