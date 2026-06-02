# Quickstart: Authentication + Consent

## Overview

This runbook covers how to run the authentication-consent feature end-to-end — locally and in CI.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase client API key for the Vite web app |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain for the Vite web app |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID for the Vite web app |
| `VITE_FIREBASE_APP_ID` | Firebase app ID for the Vite web app |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase client API key (web app) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain (web app) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID (web app) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID (web app) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Firebase Admin service account JSON (API server) |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Admin service account JSON for Vercel serverless functions |
| `FIREBASE_PROJECT_ID` | Project ID used by Firebase Admin SDK (API server) |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin client email for split Vercel secret configuration |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin private key for split Vercel secret configuration |
| `VITE_FIREBASE_AUTH_EMULATOR_HOST` | Optional local Auth emulator host for the Vite client |
| `FIREBASE_AUTH_EMULATOR_HOST` | Optional local Auth emulator host for Firebase Admin |

> **Tip**: For the current Vite app, use the `VITE_FIREBASE_*` variables at the repository root or in Vercel. `NEXT_PUBLIC_*` remains accepted by the client helper for compatibility with earlier Next.js-oriented specs. Never commit real secret values.

---

## Running Tests

### Unit tests (Vitest — no Firebase required)

```sh
npm run test:unit
```

Covers services, types, and business logic with full mock dependencies. No live Firebase connection needed.

### Integration tests (Vitest — no Firebase required)

```sh
npm run test:integration
```

Covers contract boundaries between middleware, services, and audit sinks using mocks.

### E2E tests (Playwright — no live Firebase required)

```sh
npm run test:e2e
```

Uses `page.setContent` and route mocking — no real Firebase project needed.

---

## Running Locally with Firebase Emulators

1. Copy `.env.example` to `.env.local`.
2. Use the demo local values:
   ```sh
   VITE_FIREBASE_API_KEY=demo-api-key
   VITE_FIREBASE_AUTH_DOMAIN=demo-daily-paper.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=demo-daily-paper
   VITE_FIREBASE_APP_ID=1:000000000000:web:daily-paper-demo
   VITE_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
   FIREBASE_PROJECT_ID=demo-daily-paper
   FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
   ```
3. Start the Auth/Firestore emulators:
   ```sh
   npm run firebase:emulators
   ```
4. In another terminal, start the Vite app:
   ```sh
   npm run dev
   ```
5. Open `/signup` and `/login` to test real Firebase Auth emulator account creation and sign-in.

---

## Running End-to-End with Live Firebase

1. Create a Firebase project at <https://console.firebase.google.com>.
2. Enable **Email/Password** authentication in the Firebase Console.
3. Download a service account JSON key and provide it through `GOOGLE_APPLICATION_CREDENTIALS` locally, `FIREBASE_SERVICE_ACCOUNT_KEY` in Vercel, or the split Admin variables.
4. Set all `VITE_FIREBASE_*` variables in the local root `.env` file or in Vercel project settings.
5. Start the dev servers:
   ```sh
   npm run dev
   ```
6. Navigate to the signup page and create an account.
7. Test login, logout, and forgot-password flows manually.

---

## Vercel Deployment

1. Connect the repository to Vercel.
2. Use `npm run build` as the build command and `dist` as the output directory, as defined in `vercel.json`.
3. Configure all `VITE_FIREBASE_*` variables in Vercel for the client app.
4. Configure Firebase Admin using `FIREBASE_SERVICE_ACCOUNT_KEY` or the split Admin variables so `/api/auth/signup` can verify ID tokens.
5. Confirm Vercel rewrites send SPA routes such as `/signup`, `/login`, and `/blog` to `index.html` while preserving `/api/*` serverless routes.

---

## Known Limitations

- **Token verification**: `firebaseAuth.ts` middleware calls `getAuth().verifyIdToken()`. Without a real project, emulator, or Vercel Admin secret, this will fail. In tests this is always injected as a mock.
- **Email delivery**: Firebase's `sendPasswordResetEmail` / `sendEmailVerification` won't send emails in test/dev without a real project configured.
- **Blocked status**: The `userStatusRepository` is a stub in tests. In production, wire it to Firestore or Firebase custom claims.
- **Rate limiting**: Not enforced in the local dev path — implement at the API gateway or middleware layer before production.

---

## Test Suite Results

All tests pass with mock Firebase dependencies (no live project required):

- **Unit tests**: Pass — services and business logic validated with Vitest + mocks
- **Integration tests**: Pass — contract boundaries validated with Vitest + mocks
- **E2E tests**: Pass — public, auth, blog, onboarding, dashboard, email, and newsletter browser journeys are covered

> Note: Full end-to-end tests against a live Firebase project still require real Firebase project configuration or the local emulator variables above.
