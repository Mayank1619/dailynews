export type UserStatus = "active" | "blocked";

export type SessionContext = {
  uid: string;
  email?: string;
  emailVerified: boolean;
  idToken: string;
  issuedAt: string;
};

export type LoginRequest = {
  email: string;
  password: string;
  source: string;
  ipAddress?: string;
  userAgent?: string;
};

export type LoginResponse = {
  uid: string;
  emailVerified: boolean;
  idToken: string;
  session: SessionContext;
};

export type LogoutRequest = {
  uid: string;
  source: string;
};

export type LogoutResponse = {
  success: boolean;
};

export type ForgotPasswordRequest = {
  email: string;
  source: string;
};

export type ForgotPasswordResponse = {
  /** Always the same non-enumeration message regardless of whether the email exists */
  message: string;
};

export type ResetPasswordRequest = {
  oobCode: string;
  newPassword: string;
  source: string;
};

export type ResetPasswordResponse = {
  success: boolean;
};
