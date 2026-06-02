import type { DeliveryResult } from "./email-delivery.types";

export interface NewsletterEmailMessage {
  to: {
    email: string;
    name?: string;
  };
  subject: string;
  html: string;
  text: string;
}

export interface BrevoEmailSenderConfig {
  apiKey?: string;
  senderEmail?: string;
  senderName?: string;
}

type BrevoSendResponse = {
  messageId?: string;
};

export class BrevoEmailSender {
  constructor(private readonly config: BrevoEmailSenderConfig = readBrevoConfig()) {}

  isConfigured(): boolean {
    return Boolean(this.config.apiKey && this.config.senderEmail);
  }

  async sendNewsletter(message: NewsletterEmailMessage): Promise<DeliveryResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        errorCode: "brevo_not_configured",
        errorMessage: "Set BREVO_API_KEY and BREVO_SENDER_EMAIL before sending newsletters.",
        shouldRetry: false
      };
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.config.apiKey as string
      },
      body: JSON.stringify({
        sender: {
          email: this.config.senderEmail,
          name: this.config.senderName ?? "Daily Paper"
        },
        to: [message.to],
        subject: message.subject,
        htmlContent: message.html,
        textContent: message.text
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        errorCode: `brevo_${response.status}`,
        errorMessage: errorText.slice(0, 500),
        shouldRetry: response.status >= 500 || response.status === 429
      };
    }

    const body = (await response.json()) as BrevoSendResponse;
    return {
      success: true,
      messageId: body.messageId,
      shouldRetry: false
    };
  }
}

function readBrevoConfig(): BrevoEmailSenderConfig {
  return {
    apiKey: process.env.BREVO_API_KEY,
    senderEmail: process.env.BREVO_SENDER_EMAIL,
    senderName: process.env.BREVO_SENDER_NAME
  };
}

export const brevoEmailSender = new BrevoEmailSender();
