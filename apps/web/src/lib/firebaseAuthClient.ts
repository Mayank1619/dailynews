import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
};

function readConfigFromEnvironment(): FirebaseClientConfig {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey) {
    throw new Error("Missing Firebase client configuration: apiKey");
  }
  if (!authDomain) {
    throw new Error("Missing Firebase client configuration: authDomain");
  }
  if (!projectId) {
    throw new Error("Missing Firebase client configuration: projectId");
  }
  if (!appId) {
    throw new Error("Missing Firebase client configuration: appId");
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
