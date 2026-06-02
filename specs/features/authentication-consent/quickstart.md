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

## Known Limitations (Local Dev Without Firebase Emulator)

- **No Firebase Emulator**: Unit and integration tests mock all Firebase SDK calls. If you want to test real token flows locally, set up the [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite).
- **Token verification**: `firebaseAuth.ts` middleware calls `getAuth().verifyIdToken()`. Without a real project, emulator, or Vercel Admin secret, this will fail. In tests this is always injected as a mock.
- **Email delivery**: Firebase's `sendPasswordResetEmail` / `sendEmailVerification` won't send emails in test/dev without a real project configured.
- **Blocked status**: The `userStatusRepository` is a stub in tests. In production, wire it to Firestore or Firebase custom claims.
- **Rate limiting**: Not enforced in the local dev path — implement at the API gateway or middleware layer before production.

---

## Test Suite Results

All tests pass with mock Firebase dependencies (no live project required):

- **Unit tests**: Pass — services and business logic validated with Vitest + mocks
- **Integration tests**: Pass — contract boundaries validated with Vitest + mocks
- **E2E tests**: Partially pass — service-level and implemented public/auth scenarios run, while dashboard/blog/email browser journeys remain blocked until those routes are implemented

> Note: Full end-to-end test results against a live Firebase project require a real Firebase configuration and the remaining dashboard/blog/email routes. Unit and integration tests remain the authoritative green checks for the current implementation slice.
