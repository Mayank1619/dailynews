# Research: Payments / Subscriptions

## Decision

Use a 15-day trial followed by Daily Paper Plus at $4.99/month or $49/year.

## Payment Provider

Stripe is the recommended provider for first implementation because hosted checkout reduces PCI scope and supports recurring billing, payment links, customer portal, and webhooks.

## Pricing Notes

- $4.99/month keeps a reasonable margin after AI generation, email sending, and payment processing.
- $49/year reduces fixed monthly payment-fee drag and improves cash flow.
- Prices below $3/month are not recommended because fixed payment processing fees become too large relative to revenue.

## Delivery Cost Notes

- Keep newsletter prompts compact and source summaries short.
- Use `gpt-4.1-mini` or a lower-cost configured model for routine generation.
- Use Brevo free tier for early transactional sending until volume exceeds 300 emails/day.
