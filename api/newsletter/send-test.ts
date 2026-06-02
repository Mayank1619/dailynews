import { generateNewsletterWorkflow, sendBrevoNewsletter, type NewsletterWorkflowRequest } from "./_runtime.js";
import { assertNewsletterAdmin, parseJsonBody, type VercelRequest, type VercelResponse } from "./_shared.js";

type SendTestRequestBody = NewsletterWorkflowRequest & {
  to: {
    email: string;
    name?: string;
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    assertNewsletterAdmin(req);
    const body = parseJsonBody<SendTestRequestBody>(req.body);
    if (!body.to?.email) {
      res.status(400).json({ error: "Recipient email is required." });
      return;
    }

    const newsletter = await generateNewsletterWorkflow({
      ...body,
      date: body.date ? new Date(body.date) : new Date(),
      baseUrl: body.baseUrl ?? "https://dailynews-theta-ten.vercel.app"
    });
    const delivery = await sendBrevoNewsletter({
      to: body.to,
      subject: newsletter.subject,
      html: newsletter.html,
      text: newsletter.text
    });

    if (!delivery.success) {
      res.status(delivery.errorCode === "brevo_not_configured" ? 503 : 502).json({ newsletter, delivery });
      return;
    }

    res.status(200).json({ newsletter, delivery });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Newsletter send failed." });
  }
}
