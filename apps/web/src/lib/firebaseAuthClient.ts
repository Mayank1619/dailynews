import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
};

function readConfigFromEnvironment(): FirebaseClientConfig {
  const viteEnv = (typeof import.meta !== "undefined" ? import.meta.env : undefined) as
    | Record<string, string | undefined>
    | undefined;
  const nodeEnv = typeof process !== "undefined" ? process.env : undefined;

  const apiKey = viteEnv?.VITE_FIREBASE_API_KEY ?? nodeEnv?.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = viteEnv?.VITE_FIREBASE_AUTH_DOMAIN ?? nodeEnv?.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = viteEnv?.VITE_FIREBASE_PROJECT_ID ?? nodeEnv?.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = viteEnv?.VITE_FIREBASE_APP_ID ?? nodeEnv?.NEXT_PUBLIC_FIREBASE_APP_ID;

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

  return { apiKey, authDomain, projectId, appId };
}

function getFirebaseClientApp(): FirebaseApp {
  const existingApp = getApps()[0];
  if (existingApp) {
    return existingApp;
  }

  return initializeApp(readConfigFromEnvironment());
}

export function getFirebaseClientAuth(): Auth {
  return getAuth(getFirebaseClientApp());
}
