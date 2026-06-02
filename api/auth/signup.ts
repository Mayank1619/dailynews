import { verifyFirebaseIdToken } from "../../apps/api/src/middleware/firebaseAuth";

type VercelRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  socket?: {
    remoteAddress?: string;
  };
};

type VercelResponse = {
  status: (statusCode: number) => VercelResponse;
  json: (body: unknown) => void;
};

type SignupConsentBody = {
  consent?: {
    newsletter?: boolean;
    productUpdates?: boolean;
    offers?: boolean;
    termsVersion?: string;
  };
};

function getHeader(headers: VercelRequest["headers"], name: string): string | undefined {
  const value = headers[name] ?? headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function parseBody(body: unknown): SignupConsentBody {
  if (typeof body === "string") {
    return JSON.parse(body) as SignupConsentBody;
  }

  return (body ?? {}) as SignupConsentBody;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const verified = await verifyFirebaseIdToken({
      headers: {
        authorization: getHeader(req.headers, "authorization")
      }
    });
    const body = parseBody(req.body);
    const consent = body.consent;

    if (!consent?.newsletter) {
      res.status(400).json({ error: "Newsletter consent is required for signup." });
      return;
    }

    if (!consent.termsVersion?.trim()) {
      res.status(400).json({ error: "Terms version is required for consent capture." });
      return;
    }

    const consentRecord = {
      uid: verified.auth?.uid,
      newsletter: true,
      productUpdates: Boolean(consent.productUpdates),
      offers: Boolean(consent.offers),
      termsVersion: consent.termsVersion,
      consentedAt: new Date().toISOString(),
      source: "vercel-api-auth-signup"
    };

    console.info(JSON.stringify({ feature: "authentication-consent", eventName: "consent_captured", consentRecord }));

    res.status(201).json({
      uid: verified.auth?.uid,
      emailVerified: Boolean(verified.auth?.emailVerified),
      consent: consentRecord
    });
  } catch (error) {
    res.status(401).json({
      error: error instanceof Error ? error.message : "Firebase authentication failed."
    });
  }
}
