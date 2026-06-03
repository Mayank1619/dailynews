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

type IdentityToolkitLookupResponse = {
  users?: Array<{
    localId: string;
    email?: string;
    emailVerified?: boolean;
  }>;
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

function getFirebaseWebApiKey(): string {
  const apiKey = process.env.VITE_FIREBASE_API_KEY ?? process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Firebase Web API key for token lookup.");
  }

  return apiKey;
}

async function verifyFirebaseToken(req: VercelRequest) {
  const authorization = getHeader(req.headers, "authorization");
  const idToken = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";

  if (!idToken) {
    throw new Error("Missing Firebase bearer token");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(getFirebaseWebApiKey())}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    }
  );

  if (!response.ok) {
    throw new Error("Firebase token lookup failed.");
  }

  const lookup = (await response.json()) as IdentityToolkitLookupResponse;
  const user = lookup.users?.[0];
  if (!user?.localId) {
    throw new Error("Firebase token lookup returned no user.");
  }

  return {
    headers: req.headers,
    auth: {
      uid: user.localId,
      email: user.email,
      emailVerified: Boolean(user.emailVerified),
      token: {
        uid: user.localId,
        email: user.email,
        email_verified: Boolean(user.emailVerified)
      }
    }
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const verified = await verifyFirebaseToken(req);
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
      error: "We couldn't verify your account session. Please sign in again and retry."
    });
  }
}
