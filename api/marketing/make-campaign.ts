import { assertNewsletterAdmin, parseJsonBody, type VercelRequest, type VercelResponse } from "../newsletter/_shared.js";
import { generateMakeMarketingCampaign, type MakeMarketingCampaignRequest } from "./_runtime.js";

type MakeCampaignRequestBody = MakeMarketingCampaignRequest;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    assertNewsletterAdmin(req);
    const body = parseJsonBody<MakeCampaignRequestBody>(req.body);
    const result = await generateMakeMarketingCampaign({
      ...body,
      appId: body.appId ?? "daily-paper",
      productName: body.productName ?? "Daily Paper",
      date: body.date ? new Date(body.date) : new Date(),
      baseUrl: body.baseUrl ?? "https://dailynews-theta-ten.vercel.app",
      sampleRoute: body.sampleRoute ?? "/samples/ai-daily-paper",
      ctaRoute: body.ctaRoute ?? "/signup",
      strategy: body.strategy ?? "minimal-cost"
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Make.com campaign generation failed." });
  }
}
