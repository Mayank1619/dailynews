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
  "Firebase authentication is not configured yet. Add the Firebase web app environment variables before creating accounts or signing in.";

export function getFirebaseAuthErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.startsWith("Missing Firebase client configuration")) {
    return FIREBASE_SETUP_MESSAGE;
  }

  return error instanceof Error ? error.message : "Authentication failed. Please try again.";
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
