import { ConsentAuditService } from "../../services/consentAuditService";
import {
  createAuthenticationConsentTelemetryEvent,
  type AuthenticationConsentTelemetry
} from "./secure-signup-with-explicit-consent.telemetry";
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SessionContext,
  UserStatus
} from "./login-logout-and-password-recovery.types";

const NON_ENUMERATION_MESSAGE =
  "If an account exists for this email, a password reset link has been sent. Please check your inbox.";

export type IdentityProviderRecord = {
  uid: string;
  emailVerified: boolean;
  idToken: string;
};

export type LoginLogoutIdentityProvider = {
  signInWithEmailPassword: (email: string, password: string) => Promise<IdentityProviderRecord>;
  revokeRefreshTokens: (uid: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
};

export type UserStatusRepository = {
  getStatus: (uid: string) => Promise<UserStatus>;
};

export type LoginLogoutDependencies = {
  identityProvider: LoginLogoutIdentityProvider;
  userStatusRepository: UserStatusRepository;
  auditService: Pick<ConsentAuditService, "recordIdentityEvent" | "recordConsentEvent">;
  telemetry: AuthenticationConsentTelemetry;
  now: () => Date;
};

export class LoginLogoutAndPasswordRecoveryService {
  constructor(private readonly deps: LoginLogoutDependencies) {}

  async loginUser(request: LoginRequest): Promise<LoginResponse> {
    const { email, password, source, ipAddress, userAgent } = request;

    await this.deps.auditService.recordIdentityEvent({
      uid: email,
      eventName: "signup_attempt",
      source,
      ipAddress,
      userAgent
    });

    await this.deps.telemetry.track(
      createAuthenticationConsentTelemetryEvent("login_attempt", "success", { source })
    );

    let record: IdentityProviderRecord;
    try {
      record = await this.deps.identityProvider.signInWithEmailPassword(email, password);
    } catch (error) {
      await this.deps.telemetry.track(
        createAuthenticationConsentTelemetryEvent("login_failure", "error", {
          source,
          reason: error instanceof Error ? error.message : "unknown"
        })
      );
      throw error;
    }

    const status = await this.deps.userStatusRepository.getStatus(record.uid);
    if (status === "blocked") {
      await this.deps.telemetry.track(
        createAuthenticationConsentTelemetryEvent("blocked_access_denied", "error", {
          uid: record.uid,
          source
        })
      );
      throw new Error("Account is blocked");
    }

    const issuedAt = this.deps.now().toISOString();
    const session: SessionContext = {
      uid: record.uid,
      emailVerified: record.emailVerified,
      idToken: record.idToken,
      issuedAt
    };

    await this.deps.auditService.recordIdentityEvent({
      uid: record.uid,
      eventName: "signup_success",
      source,
      ipAddress,
      userAgent
    });

    await this.deps.telemetry.track(
      createAuthenticationConsentTelemetryEvent("login_success", "success", {
        uid: record.uid,
        source,
        emailVerified: record.emailVerified
      })
    );

    return {
      uid: record.uid,
      emailVerified: record.emailVerified,
      idToken: record.idToken,
      session
    };
  }

  async logoutUser(request: LogoutRequest): Promise<LogoutResponse> {
    const { uid, source } = request;

    await this.deps.identityProvider.revokeRefreshTokens(uid);

    await this.deps.telemetry.track(
      createAuthenticationConsentTelemetryEvent("logout", "success", { uid, source })
    );

    return { success: true };
  }

  async requestPasswordReset(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const { email, source } = request;

    try {
      await this.deps.identityProvider.sendPasswordResetEmail(email);
    } catch {
      // Intentionally swallow all errors — non-enumeration: never reveal whether email exists
    }

    await this.deps.telemetry.track(
      createAuthenticationConsentTelemetryEvent("password_reset_requested", "success", { source })
    );

    return { message: NON_ENUMERATION_MESSAGE };
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const { source } = request;

    await this.deps.telemetry.track(
      createAuthenticationConsentTelemetryEvent("password_reset_completed", "success", { source })
    );

    return { success: true };
  }
}
