import { generateNewsletterWorkflow, type NewsletterWorkflowRequest } from "./_runtime.js";
import { assertNewsletterAdmin, parseJsonBody, type VercelRequest, type VercelResponse } from "./_shared.js";

type PreviewRequestBody = NewsletterWorkflowRequest;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    assertNewsletterAdmin(req);
    const body = parseJsonBody<PreviewRequestBody>(req.body);
    const result = await generateNewsletterWorkflow({
      ...body,
      date: body.date ? new Date(body.date) : new Date(),
      baseUrl: body.baseUrl ?? "https://dailynews-theta-ten.vercel.app"
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Newsletter preview failed." });
  }
}
