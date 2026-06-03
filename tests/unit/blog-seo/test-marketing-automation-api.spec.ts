import { describe, expect, it } from "vitest";
import handler from "../../../api/marketing/automation-run";
import type { VercelRequest, VercelResponse } from "../../../api/newsletter/_shared";

function createJsonResponse() {
  const response = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this as unknown as VercelResponse;
    },
    json(payload: unknown) {
      this.body = payload;
    }
  };

  return response;
}

describe("marketing automation API", () => {
  it("accepts secured Vercel Cron GET requests", async () => {
    const originalCronSecret = process.env.CRON_SECRET;
    const originalOpenAiKey = process.env.OPENAI_API_KEY;
    process.env.CRON_SECRET = "cron-test-token";
    delete process.env.OPENAI_API_KEY;

    const response = createJsonResponse();

    try {
      await handler(
        {
          method: "GET",
          headers: {
            authorization: "Bearer cron-test-token"
          }
        } satisfies VercelRequest,
        response as unknown as VercelResponse
      );

      expect(response.statusCode).toBe(200);
      expect((response.body as { provider: string }).provider).toBe("vercel-cron");
      expect((response.body as { apps: Array<{ appId: string }> }).apps.map((app) => app.appId)).toEqual(["daily-paper", "astroya"]);
    } finally {
      process.env.CRON_SECRET = originalCronSecret;
      process.env.OPENAI_API_KEY = originalOpenAiKey;
    }
  });

  it("accepts manual POST requests with the newsletter admin token", async () => {
    const originalAdminToken = process.env.NEWSLETTER_ADMIN_TOKEN;
    const originalOpenAiKey = process.env.OPENAI_API_KEY;
    process.env.NEWSLETTER_ADMIN_TOKEN = "admin-test-token";
    delete process.env.OPENAI_API_KEY;

    const response = createJsonResponse();

    try {
      await handler(
        {
          method: "POST",
          headers: {
            authorization: "Bearer admin-test-token"
          },
          body: {
            appIds: ["daily-paper"],
            provider: "manual",
            mode: "draft-only"
          }
        } satisfies VercelRequest,
        response as unknown as VercelResponse
      );

      expect(response.statusCode).toBe(200);
      expect((response.body as { provider: string }).provider).toBe("manual");
      expect((response.body as { apps: Array<{ appId: string }> }).apps).toHaveLength(1);
    } finally {
      process.env.NEWSLETTER_ADMIN_TOKEN = originalAdminToken;
      process.env.OPENAI_API_KEY = originalOpenAiKey;
    }
  });

  it("rejects unauthenticated scheduled runs", async () => {
    const originalCronSecret = process.env.CRON_SECRET;
    process.env.CRON_SECRET = "cron-test-token";
    const response = createJsonResponse();

    try {
      await handler(
        {
          method: "GET",
          headers: {}
        } satisfies VercelRequest,
        response as unknown as VercelResponse
      );

      expect(response.statusCode).toBe(400);
      expect((response.body as { error: string }).error).toBe("Invalid cron authorization token.");
    } finally {
      process.env.CRON_SECRET = originalCronSecret;
    }
  });
});
