import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";

type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  authEmulatorHost?: string;
};

const FIREBASE_SETUP_MESSAGE =
  "Account access is not fully configured for this site yet. Please try again later.";

const GENERIC_AUTH_MESSAGE = "We couldn't complete that request. Please check your details and try again.";
const GENERIC_LOGIN_MESSAGE = "The email or password doesn't look right. Please try again or reset your password.";

export function getFirebaseAuthErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.startsWith("Missing Firebase client configuration")) {
    return FIREBASE_SETUP_MESSAGE;
  }

  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";

  if (code === "app/signup-api-failed") {
    return "Your account was created, but we couldn't finish setup. Please sign in and complete your preferences.";
  }

  if (code === "auth/email-already-in-use") {
    return "An account with this email already exists. Sign in or reset your password.";
  }

  if (code === "auth/invalid-email") {
    return "Enter a valid email address.";
  }

  if (code === "auth/missing-password") {
    return "Enter your password.";
  }

  if (code === "auth/weak-password") {
    return "Use a stronger password with at least 12 characters.";
  }

  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return GENERIC_LOGIN_MESSAGE;
  }

  if (code === "auth/user-disabled") {
    return "This account is currently unavailable. Contact support if you think this is a mistake.";
  }

  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please wait a few minutes before trying again.";
  }

  if (code === "auth/network-request-failed") {
    return "We couldn't reach the sign-in service. Check your connection and try again.";
  }

  if (code === "auth/operation-not-allowed" || code === "auth/provider-already-linked") {
    return "This sign-in option is not available yet. Please use email and password for now.";
  }

  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return "The sign-in window was closed before it finished.";
  }

  if (code === "auth/popup-blocked") {
    return "Your browser blocked the sign-in window. Allow popups for this site and try again.";
  }

  if (code === "auth/account-exists-with-different-credential") {
    return "An account already exists for this email with a different sign-in method.";
  }

  if (code === "auth/unauthorized-domain") {
    return "Sign-in is not enabled for this website address yet. Please contact support.";
  }

  const rawMessage = error instanceof Error ? error.message : "";
  if (rawMessage.includes("Signup failed with status")) {
    return "We couldn't finish account setup. Please try signing in, then complete your preferences.";
  }

  return GENERIC_AUTH_MESSAGE;
}

function readConfigFromEnvironment(): FirebaseClientConfig {
  const viteEnv = (typeof import.meta !== "undefined" ? import.meta.env : undefined) as
    | Record<string, string | undefined>
    | undefined;
  const nodeEnv = typeof process !== "undefined" ? process.env : undefined;

  const apiKey = viteEnv?.VITE_FIREBASE_API_KEY ?? nodeEnv?.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = viteEnv?.VITE_FIREBASE_AUTH_DOMAIN ?? nodeEnv?.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = viteEnv?.VITE_FIREBASE_PROJECT_ID ?? nodeEnv?.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = viteEnv?.VITE_FIREBASE_APP_ID ?? nodeEnv?.NEXT_PUBLIC_FIREBASE_APP_ID;
  const authEmulatorHost = viteEnv?.VITE_FIREBASE_AUTH_EMULATOR_HOST ?? nodeEnv?.FIREBASE_AUTH_EMULATOR_HOST;

  if (!apiKey) {
    throw new Error("Missing Firebase client configuration: VITE_FIREBASE_API_KEY");
  }
  if (!authDomain) {
    throw new Error("Missing Firebase client configuration: VITE_FIREBASE_AUTH_DOMAIN");
  }
  if (!projectId) {
    throw new Error("Missing Firebase client configuration: VITE_FIREBASE_PROJECT_ID");
  }
  if (!appId) {
    throw new Error("Missing Firebase client configuration: VITE_FIREBASE_APP_ID");
  }

  return { apiKey, authDomain, projectId, appId, authEmulatorHost };
}

function getFirebaseClientApp(): FirebaseApp {
  const existingApp = getApps()[0];
  if (existingApp) {
    return existingApp;
  }

  return initializeApp(readConfigFromEnvironment());
}

export function getFirebaseClientAuth(): Auth {
  const auth = getAuth(getFirebaseClientApp());
  const { authEmulatorHost } = readConfigFromEnvironment();

  if (authEmulatorHost && !(auth as Auth & { emulatorConfig?: unknown }).emulatorConfig) {
    const emulatorUrl = authEmulatorHost.startsWith("http")
      ? authEmulatorHost
      : `http://${authEmulatorHost}`;
    connectAuthEmulator(auth, emulatorUrl, { disableWarnings: true });
  }

  return auth;
}
