import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  type UserCredential
} from "firebase/auth";
import { DESIGN_TOKENS } from "../design-system/tokens";
import { getFirebaseAuthErrorMessage, getFirebaseClientAuth } from "../../lib/firebaseAuthClient";

export const AUTH_SIGNUP_COPY = {
  heading: "Create your Daily Paper account",
  subheading: "Use email signup and choose exactly which updates you want.",
  emailLabel: "Email",
  passwordLabel: "Password",
  socialHeading: "Or continue with",
  googleLabel: "Google",
  facebookLabel: "Facebook",
  newsletterLabel: "I agree to receive the Daily Paper newsletter (required)",
  productUpdatesLabel: "Send me product updates (optional)",
  offersLabel: "Send me offers and promotions (optional)",
  submitLabel: "Create account",
  successMessage: "Signup complete. Please verify your email before newsletter delivery."
} as const;

export function validateSignupForm(form: SecureSignupConsentForm): string {
  if (!form.email.trim()) {
    return "Enter your email address.";
  }

  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    return "Enter a valid email address.";
  }

  if (form.password.length < 12) {
    return "Use at least 12 characters for your password.";
  }

  if (!form.newsletter) {
    return "Newsletter consent is required to create your Daily Paper.";
  }

  return "";
}

export type SocialAuthProviderId = "google" | "facebook";

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
    await telemetry?.track("secure_signup_failed", { status: response.status });
    throw Object.assign(new Error("Account setup failed."), { code: "app/signup-api-failed" });
  }

  await telemetry?.track("secure_signup_submitted", {
    newsletter: form.newsletter,
    productUpdates: form.productUpdates,
    offers: form.offers,
    termsVersion: form.termsVersion
  });
}

function createSocialProvider(providerId: SocialAuthProviderId): GoogleAuthProvider | FacebookAuthProvider {
  if (providerId === "google") {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    return provider;
  }

  const provider = new FacebookAuthProvider();
  provider.addScope("email");
  provider.addScope("public_profile");
  return provider;
}

export async function submitSocialSignupWithConsent(
  providerId: SocialAuthProviderId,
  form: Omit<SecureSignupConsentForm, "email" | "password">,
  telemetry?: AuthTelemetryClient
): Promise<void> {
  const credentials: UserCredential = await signInWithPopup(getFirebaseClientAuth(), createSocialProvider(providerId));
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
    await telemetry?.track("social_signup_failed", { provider: providerId, status: response.status });
    throw Object.assign(new Error("Account setup failed."), { code: "app/signup-api-failed" });
  }

  await telemetry?.track("social_signup_submitted", {
    provider: providerId,
    newsletter: form.newsletter,
    productUpdates: form.productUpdates,
    offers: form.offers,
    termsVersion: form.termsVersion
  });
}

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(17,24,39,0.94), rgba(12,17,34,0.9))",
  color: DESIGN_TOKENS.colors.textPrimary,
  border: "1px solid rgba(34,211,238,0.22)",
  borderRadius: 18,
  padding: DESIGN_TOKENS.spacing[3],
  boxShadow: "0 24px 70px rgba(0,0,0,0.42), 0 0 38px rgba(168,85,247,0.12)",
  width: "100%",
  maxWidth: 680,
  margin: "0 auto",
  font: DESIGN_TOKENS.typography.body
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid rgba(167,179,200,0.32)",
  borderRadius: 10,
  padding: "10px 12px",
  marginTop: 6,
  marginBottom: 14,
  background: "rgba(7,9,18,0.82)",
  color: DESIGN_TOKENS.colors.textPrimary,
  outlineColor: DESIGN_TOKENS.colors.brandPrimary
};

const submitStyle: React.CSSProperties = {
  width: "100%",
  border: 0,
  borderRadius: 10,
  padding: "12px 16px",
  background: `linear-gradient(120deg, ${DESIGN_TOKENS.colors.brandPrimary}, ${DESIGN_TOKENS.colors.brandSecondary})`,
  color: "#07111F",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 0 24px rgba(34,211,238,0.3)"
};

const socialGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
  marginTop: 14
};

const socialButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(34,211,238,0.28)",
  borderRadius: 10,
  padding: "11px 14px",
  background: "rgba(7,9,18,0.82)",
  color: DESIGN_TOKENS.colors.textPrimary,
  fontWeight: 800,
  cursor: "pointer"
};

const statusStyle: React.CSSProperties = {
  marginTop: 16,
  color: DESIGN_TOKENS.colors.warning
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = <K extends keyof SecureSignupConsentForm>(key: K, value: SecureSignupConsentForm[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleSocialSignup = async (providerId: SocialAuthProviderId): Promise<void> => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage("");
    try {
      if (!form.newsletter) {
        setStatusMessage("Newsletter consent is required to create your Daily Paper.");
        return;
      }

      await submitSocialSignupWithConsent(providerId, form);
      window.location.assign("/onboarding");
    } catch (error) {
      setStatusMessage(getFirebaseAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      style={{
        minHeight: "100vh",
        padding: DESIGN_TOKENS.spacing[3],
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
        alignItems: "center",
        gap: DESIGN_TOKENS.spacing[3],
        background:
          "radial-gradient(circle at 10% 0%, rgba(34,211,238,0.24), transparent 34%), radial-gradient(circle at 90% 8%, rgba(244,114,182,0.2), transparent 34%), #070912"
      }}
    >
      <aside style={{ maxWidth: 560 }}>
        <p style={{ color: DESIGN_TOKENS.colors.brandPrimary, fontWeight: 800, margin: 0 }}>Daily Paper</p>
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, margin: "8px 0 12px" }}>Build a paper that sounds like you.</h1>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary, maxWidth: 520 }}>
          Create the account first, then choose the exact topics, frequency, region, and delivery time for your AI-generated newsletter.
        </p>
        <p style={{ marginTop: DESIGN_TOKENS.spacing[2], color: DESIGN_TOKENS.colors.textSecondary }}>
          Powered by{" "}
          <a href="https://www.netfroot.com/" style={{ color: DESIGN_TOKENS.colors.brandPrimary, fontWeight: 800 }}>
            Netfroot
          </a>
        </p>
      </aside>
      <form
        style={cardStyle}
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          if (isSubmitting) return;

          setIsSubmitting(true);
          setStatusMessage("");
          try {
            const validationMessage = validateSignupForm(form);
            if (validationMessage) {
              setStatusMessage(validationMessage);
              return;
            }

            await submitSecureSignupWithConsent(form);
            setStatusMessage(AUTH_SIGNUP_COPY.successMessage);
            window.location.assign("/onboarding");
          } catch (error) {
            setStatusMessage(getFirebaseAuthErrorMessage(error));
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <h1 style={{ font: DESIGN_TOKENS.typography.h2, marginBottom: 8 }}>{AUTH_SIGNUP_COPY.heading}</h1>
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

        <button type="submit" style={submitStyle} disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : AUTH_SIGNUP_COPY.submitLabel}
        </button>

        {statusMessage ? <p role="status" aria-live="polite" style={statusStyle}>{statusMessage}</p> : null}

        <p style={{ color: DESIGN_TOKENS.colors.textSecondary, fontWeight: 800, marginBottom: 8 }}>
          {AUTH_SIGNUP_COPY.socialHeading}
        </p>
        <div style={socialGridStyle}>
          <button
            type="button"
            style={socialButtonStyle}
            disabled={isSubmitting}
            onClick={() => void handleSocialSignup("google")}
          >
            {AUTH_SIGNUP_COPY.googleLabel}
          </button>
          <button
            type="button"
            style={socialButtonStyle}
            disabled={isSubmitting}
            onClick={() => void handleSocialSignup("facebook")}
          >
            {AUTH_SIGNUP_COPY.facebookLabel}
          </button>
        </div>
        <p style={{ textAlign: "center", color: DESIGN_TOKENS.colors.textSecondary }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: DESIGN_TOKENS.colors.brandPrimary, fontWeight: 800 }}>
            Sign in
          </a>
        </p>
      </form>
    </section>
  );
}
