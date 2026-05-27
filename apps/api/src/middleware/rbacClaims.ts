import type { FirebaseDecodedToken } from "./firebaseAuth";

export type AdminRole = "admin" | "super_admin";

export type AdminClaimsContext = {
  uid: string;
  email?: string;
  role: AdminRole;
};

/**
 * Asserts that a decoded Firebase ID token carries a valid admin role claim.
 * Throws with a standardised denied message on failure so callers can audit-log
 * the attempt before re-throwing or returning 403.
 */
export function requireAdminClaim(token: FirebaseDecodedToken): AdminClaimsContext {
  const role = (token as Record<string, unknown>).role;

  if (role !== "admin" && role !== "super_admin") {
    throw new Error("Insufficient permissions: admin role required");
  }

  return {
    uid: token.uid,
    email: token.email,
    role: role as AdminRole
  };
}
