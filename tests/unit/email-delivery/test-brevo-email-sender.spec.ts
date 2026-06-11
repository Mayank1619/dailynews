import { describe, expect, it } from "vitest";
import { BrevoEmailSender } from "../../../apps/api/src/features/email-delivery/brevoEmailSender";

describe("Brevo email sender", () => {
  it("reports a setup error when Brevo credentials are missing", async () => {
    const sender = new BrevoEmailSender({});
    const result = await sender.sendNewsletter({
      to: { email: "reader@example.com" },
      subject: "Daily Paper",
      html: "<p>Hello</p>",
      text: "Hello"
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("brevo_not_configured");
    expect(result.shouldRetry).toBe(false);
  });
});
