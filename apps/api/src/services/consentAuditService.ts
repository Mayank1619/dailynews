import { createHash } from "node:crypto";

export type ConsentAuditMetadata = Record<string, string | number | boolean>;

export type ConsentAuditEvent = {
  feature: "authentication-consent";
  eventName: string;
  occurredAt: string;
  metadata: ConsentAuditMetadata;
};

export type ConsentAuditSink = (event: ConsentAuditEvent) => void | Promise<void>;

export type IdentityAuditInput = {
  uid: string;
  eventName: "signup_attempt" | "signup_success" | "signup_failed";
  source: string;
  ipAddress?: string;
  userAgent?: string;
};

export type ConsentAuditInput = {
  uid: string;
  newsletter: boolean;
  productUpdates: boolean;
  offers: boolean;
  termsVersion: string;
  source: string;
};

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

export class ConsentAuditService {
  constructor(private readonly sink: ConsentAuditSink = (event) => console.info(JSON.stringify(event))) {}

  async recordIdentityEvent(input: IdentityAuditInput): Promise<void> {
    await this.sink({
      feature: "authentication-consent",
      eventName: input.eventName,
      occurredAt: new Date().toISOString(),
      metadata: {
        uid: input.uid,
        source: input.source,
        ...(input.ipAddress ? { ipHash: hashValue(input.ipAddress) } : {}),
        ...(input.userAgent ? { userAgentHash: hashValue(input.userAgent) } : {})
      }
    });
  }

  async recordConsentEvent(input: ConsentAuditInput): Promise<void> {
    await this.sink({
      feature: "authentication-consent",
      eventName: "consent_captured",
      occurredAt: new Date().toISOString(),
      metadata: {
        uid: input.uid,
        source: input.source,
        newsletter: input.newsletter,
        productUpdates: input.productUpdates,
        offers: input.offers,
        termsVersion: input.termsVersion
      }
    });
  }
}
