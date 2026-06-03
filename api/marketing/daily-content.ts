import { assertNewsletterAdmin, parseJsonBody, type VercelRequest, type VercelResponse } from "../newsletter/_shared.js";
import { generateDailyMarketingContent, type MarketingAgentRequest } from "./_runtime.js";

type DailyContentRequestBody = MarketingAgentRequest;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    assertNewsletterAdmin(req);
    const body = parseJsonBody<DailyContentRequestBody>(req.body);
    const result = await generateDailyMarketingContent({
      ...body,
      date: body.date ? new Date(body.date) : new Date(),
      baseUrl: body.baseUrl ?? "https://dailynews-theta-ten.vercel.app"
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Marketing content generation failed." });
  }
}
