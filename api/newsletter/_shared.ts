export type VercelRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

export type VercelResponse = {
  status: (statusCode: number) => VercelResponse;
  json: (body: unknown) => void;
};

export function parseJsonBody<T>(body: unknown): T {
  if (typeof body === "string") {
    return JSON.parse(body) as T;
  }

  return (body ?? {}) as T;
}

export function getHeader(headers: VercelRequest["headers"], name: string): string | undefined {
  const value = headers[name] ?? headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function normalizeSecret(value: string | undefined): string {
  return (value ?? "").trim().replace(/^"|"$/g, "").replace(/\\[rn]/g, "").trim();
}

export function assertNewsletterAdmin(req: VercelRequest): void {
  const expected = normalizeSecret(process.env.NEWSLETTER_ADMIN_TOKEN);
  if (!expected) {
    throw new Error("NEWSLETTER_ADMIN_TOKEN is required before newsletter API routes can run.");
  }

  const authorization = getHeader(req.headers, "authorization");
  const actual = authorization?.startsWith("Bearer ") ? normalizeSecret(authorization.slice("Bearer ".length)) : "";

  if (actual !== expected) {
    throw new Error("Invalid newsletter admin token.");
  }
}
