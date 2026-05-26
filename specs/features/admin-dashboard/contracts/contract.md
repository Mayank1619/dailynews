# Contract - Admin Dashboard

## Protected Routes
- GET /admin
- GET /admin/users
- PATCH /admin/users/{userId}/status
- GET /admin/audit

## AuthZ
- Requires Firebase Auth ID token.
- Requires custom claim role in {admin, super_admin}.

## Audit Contract
- Every mutating admin action emits AdminActionLog with actor UID and outcome.
