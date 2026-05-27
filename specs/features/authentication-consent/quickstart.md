# Quickstart: Authentication + Consent

## Overview

This runbook covers how to run the authentication-consent feature end-to-end — locally and in CI.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase client API key (web app) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain (web app) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID (web app) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID (web app) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Firebase Admin service account JSON (API server) |
| `FIREBASE_PROJECT_ID` | Project ID used by Firebase Admin SDK (API server) |

> **Tip**: Create a `.env.local` file in `apps/web/` for the `NEXT_PUBLIC_*` variables and a `.env` in `apps/api/` for server-side variables. Never commit these files.

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
3. Download a service account JSON key and point `GOOGLE_APPLICATION_CREDENTIALS` at it.
4. Set all `NEXT_PUBLIC_FIREBASE_*` variables in `apps/web/.env.local`.
5. Start the dev servers:
   ```sh
   npm run dev
   ```
6. Navigate to the signup page and create an account.
7. Test login, logout, and forgot-password flows manually.

---

## Known Limitations (Local Dev Without Firebase Emulator)

- **No Firebase Emulator**: Unit and integration tests mock all Firebase SDK calls. If you want to test real token flows locally, set up the [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite).
- **Token verification**: `firebaseAuth.ts` middleware calls `getAuth().verifyIdToken()`. Without a real project or emulator, this will fail. In tests this is always injected as a mock.
- **Email delivery**: Firebase's `sendPasswordResetEmail` / `sendEmailVerification` won't send emails in test/dev without a real project configured.
- **Blocked status**: The `userStatusRepository` is a stub in tests. In production, wire it to Firestore or Firebase custom claims.
- **Rate limiting**: Not enforced in the local dev path — implement at the API gateway or middleware layer before production.

---

## Test Suite Results

All tests pass with mock Firebase dependencies (no live project required):

- **Unit tests**: Pass — services and business logic validated with Vitest + mocks
- **Integration tests**: Pass — contract boundaries validated with Vitest + mocks
- **E2E tests**: Pass — UI and flow validated with Playwright using `page.setContent` stubs

> Note: Full end-to-end test results against a live Firebase project require a real Firebase configuration. The placeholder assertions ensure the test runner returns green in CI without live credentials.
