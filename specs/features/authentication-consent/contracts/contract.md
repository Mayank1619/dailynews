# Contract - Authentication and Consent

## API
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/password-reset
- GET /api/consent
- PUT /api/consent

## Auth Contract
- Firebase Auth handles credential lifecycle and ID token issuance.
- Backend verifies ID tokens and binds requests to UID.
