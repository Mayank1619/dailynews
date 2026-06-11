import { describe, expect, it } from "vitest";
import { validateLoginForm } from "../../../apps/web/src/features/authentication-consent/login-logout-and-password-recovery";
import { validateSignupForm } from "../../../apps/web/src/features/authentication-consent/secure-signup-with-explicit-consent";
import { getFirebaseAuthErrorMessage } from "../../../apps/web/src/lib/firebaseAuthClient";

describe("user-safe authentication messages", () => {
  const forbiddenTerms = ["Firebase", "firebase", "auth/", "token lookup", "Signup failed with status"];

  it("maps existing-account signup errors to helpful product copy", () => {
    const message = getFirebaseAuthErrorMessage(
      Object.assign(new Error("Firebase: Error (auth/email-already-in-use)."), {
        code: "auth/email-already-in-use"
      })
    );

    expect(message).toBe("An account with this email already exists. Sign in or reset your password.");
    expect(forbiddenTerms.some((term) => message.includes(term))).toBe(false);
  });

  it("uses a non-enumerating message for invalid login credentials", () => {
    const message = getFirebaseAuthErrorMessage(
      Object.assign(new Error("Firebase: Error (auth/invalid-credential)."), {
        code: "auth/invalid-credential"
      })
    );

    expect(message).toBe("The email or password doesn't look right. Please try again or reset your password.");
    expect(forbiddenTerms.some((term) => message.includes(term))).toBe(false);
  });

  it("does not expose raw provider or API status details for unknown errors", () => {
    const providerMessage = getFirebaseAuthErrorMessage(new Error("Firebase token lookup failed."));
    const apiMessage = getFirebaseAuthErrorMessage(new Error("Signup failed with status 401"));

    expect(providerMessage).toBe("We couldn't complete that request. Please check your details and try again.");
    expect(apiMessage).toBe("We couldn't finish account setup. Please try signing in, then complete your preferences.");
    expect(forbiddenTerms.some((term) => providerMessage.includes(term) || apiMessage.includes(term))).toBe(false);
  });

  it("validates signup fields with actionable messages before auth submission", () => {
    expect(
      validateSignupForm({
        email: "",
        password: "short",
        newsletter: true,
        productUpdates: false,
        offers: false,
        termsVersion: "2026.05"
      })
    ).toBe("Enter your email address.");

    expect(
      validateSignupForm({
        email: "reader@example.com",
        password: "short",
        newsletter: true,
        productUpdates: false,
        offers: false,
        termsVersion: "2026.05"
      })
    ).toBe("Use at least 12 characters for your password.");
  });

  it("validates login fields with actionable messages before auth submission", () => {
    expect(validateLoginForm({ email: "", password: "" })).toBe("Enter your email address.");
    expect(validateLoginForm({ email: "not-an-email", password: "Password-1234" })).toBe("Enter a valid email address.");
    expect(validateLoginForm({ email: "reader@example.com", password: "" })).toBe("Enter your password.");
  });
});
