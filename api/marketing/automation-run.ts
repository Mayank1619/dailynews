import {
  assertNewsletterAdmin,
  getHeader,
  parseJsonBody,
  type VercelRequest,
  type VercelResponse
} from "../newsletter/_shared.js";
import {
  generateMarketingAutomationRun,
  type MarketingAutomationRunRequest
} from "./_runtime.js";

type AutomationRunRequestBody = MarketingAutomationRunRequest;

function normalizeSecret(value: string | undefined): string {
  return (value ?? "").trim().replace(/^"|"$/g, "").replace(/\\[rn]/g, "").trim();
}

function assertVercelCron(req: VercelRequest): void {
  const expected = normalizeSecret(process.env.CRON_SECRET);
  if (!expected) {
    throw new Error("CRON_SECRET is required before scheduled marketing automation can run.");
  }

  const authorization = getHeader(req.headers, "authorization");
  if (authorization !== `Bearer ${expected}`) {
    throw new Error("Invalid cron authorization token.");
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const isCronRun = req.method === "GET";
    if (isCronRun) {
      assertVercelCron(req);
    } else {
      assertNewsletterAdmin(req);
    }

    const body = isCronRun ? {} : parseJsonBody<AutomationRunRequestBody>(req.body);
    const result = await generateMarketingAutomationRun({
      ...body,
      provider: body.provider ?? (isCronRun ? "vercel-cron" : "manual"),
      mode: body.mode ?? "draft-only",
      date: body.date ? new Date(body.date) : new Date()
    });

    console.info(
      JSON.stringify({
        feature: "blog-seo",
        eventName: "marketing_automation_run_created",
        runId: result.runId,
        provider: result.provider,
        appCount: result.apps.length,
        status: result.status
      })
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Marketing automation run failed."
    });
  }
}
