import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export type FirebaseDecodedToken = {
  uid: string;
  email?: string;
  email_verified?: boolean;
};

export type FirebaseAuthContext = {
  uid: string;
  email?: string;
  emailVerified: boolean;
  token: FirebaseDecodedToken;
};

export type FirebaseRequestContext = {
  headers: Record<string, string | undefined>;
  auth?: FirebaseAuthContext;
};

export type FirebaseTokenVerifier = {
  verifyIdToken: (idToken: string) => Promise<FirebaseDecodedToken>;
};

function getFirebaseAdminApp(): App {
  const existing = getApps()[0];
  if (existing) {
    return existing;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson) {
    return initializeApp({
      credential: cert(JSON.parse(serviceAccountJson))
    });
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey })
    });
  }

  return initializeApp();
}

export function createFirebaseAdminTokenVerifier(): FirebaseTokenVerifier {
  return {
    async verifyIdToken(idToken: string): Promise<FirebaseDecodedToken> {
      const decodedToken = await getAuth(getFirebaseAdminApp()).verifyIdToken(idToken, true);
      return decodedToken;
    }
  };
}

function parseBearerToken(authorizationHeader?: string): string {
  if (!authorizationHeader) {
    throw new Error("Missing Firebase bearer token");
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new Error("Invalid Firebase bearer token format");
  }

  return token;
}

export async function verifyFirebaseIdToken(
  context: FirebaseRequestContext,
  verifier: FirebaseTokenVerifier = createFirebaseAdminTokenVerifier()
): Promise<FirebaseRequestContext> {
  const authorizationHeader = context.headers.authorization ?? context.headers.Authorization;
  const idToken = parseBearerToken(authorizationHeader);
  const decodedToken = await verifier.verifyIdToken(idToken);

  return {
    ...context,
    auth: {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: Boolean(decodedToken.email_verified),
      token: decodedToken
    }
  };
}
