export type SecureSignupConsentInput = {
  newsletter: boolean;
  productUpdates?: boolean;
  offers?: boolean;
  termsVersion: string;
};

export type SecureSignupCommand = {
  email: string;
  password: string;
  consent: SecureSignupConsentInput;
  source: string;
  ipAddress?: string;
  userAgent?: string;
};

export type ConsentRecord = {
  uid: string;
  newsletter: boolean;
  productUpdates: boolean;
  offers: boolean;
  termsVersion: string;
  consentedAt: string;
};

export type SecureSignupResult = {
  uid: string;
  emailVerified: boolean;
  consent: ConsentRecord;
};

export type AuthIdentityRecord = {
  uid: string;
  emailVerified: boolean;
};
