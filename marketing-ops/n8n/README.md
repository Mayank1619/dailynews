# n8n Social Video Automation

n8n is a better long-term fit than browser-driving Make when we want repeatable setup for multiple apps.

## Why n8n

- Workflows can be exported and imported as JSON.
- Webhook nodes have separate test and production URLs.
- Webhook payloads allow up to 16 MB by default, which is enough for the current small MP4 bundles.
- Self-hosting is possible later if n8n Cloud becomes too expensive.

## Starter Workflow

Import this workflow into n8n:

```text
marketing-ops/n8n/social-video-webhook.workflow.json
```

It starts with:

```text
Webhook -> Normalize Social Payload -> Respond Accepted
```

After importing:

1. Open the `Receive Social Video Bundle` webhook node.
2. Use the test URL while the workflow is listening for a test event.
3. Put that URL into `N8N_SOCIAL_WEBHOOK_URL`.
4. Run:

```bash
npm run marketing:render-videos -- daily-paper
$env:N8N_SOCIAL_WEBHOOK_URL="https://your-n8n-webhook-test-url"
$env:SOCIAL_AUTO_POST="true"
npm run marketing:publish-social-videos -- daily-paper
```

When the test payload arrives, n8n should show the normalized values:

- `appId`
- `title`
- `caption`
- `targetUrl`
- `videoFileName`
- `videoBase64`
- `coverBase64`

## Production Setup

When the test works:

1. Add Header Auth to the n8n webhook.
2. Set the header name to `X-DailyNews-Token`.
3. Set the same secret value in `N8N_SOCIAL_WEBHOOK_TOKEN`.
4. Switch `N8N_SOCIAL_WEBHOOK_URL` to the production webhook URL.
5. Activate the n8n workflow.
6. Keep `SOCIAL_AUTO_POST=true`.

GitHub Actions already passes these optional secrets:

```text
N8N_SOCIAL_WEBHOOK_URL
N8N_SOCIAL_WEBHOOK_TOKEN
N8N_SOCIAL_WEBHOOK_HEADER
SOCIAL_AUTO_POST
```

## Social Posting Nodes

Once the webhook is receiving payloads reliably, add platform routes after `Normalize Social Payload`:

- YouTube Shorts: upload `videoBase64` as the video file, use `title` and `description`.
- Instagram Reels: upload `videoBase64`, use `caption`.
- Facebook Page/Reels: upload `videoBase64`, use `caption`.

Use separate credentials or workflow branches for Daily Paper and Astroya. Route by `appId`.
