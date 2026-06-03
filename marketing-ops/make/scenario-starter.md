# Make.com Starter Scenario

## Goal

Create one daily draft package per app for YouTube Shorts, Instagram Reels, and Facebook Reels while keeping costs minimal.

## Modules

1. Scheduler
   - Run once daily.
   - Start with Daily Paper only.
   - Add Astroya as a copied scenario or router branch after account connections are stable.

2. HTTP
   - Method: `POST`
   - URL: `https://dailynews-theta-ten.vercel.app/api/marketing/make-campaign`
   - Header: `Authorization: Bearer {{NEWSLETTER_ADMIN_TOKEN}}`
   - Header: `Content-Type: application/json`
   - Body: use the app profile payload template below.

3. Storage
   - First choice while testing: local/exported JSON or Google Sheets.
   - Columns: appId, productName, date, platform, format, copy, hashtags, targetUrl, approvalStatus, postedUrl, notes.

4. Approval Digest
   - Send the generated drafts to the owner by email or Slack.
   - Approval status stays `draft` until manually reviewed.

5. Platform Draft Routes
   - YouTube Shorts: store title, caption, script, target URL.
   - Instagram Reels: store caption, hashtags, script, target URL.
   - Facebook Reels/Page: store caption, hashtags, script, target URL.

## Daily Paper Payload

Use `marketing-ops/apps/daily-paper/make-payload.json`.

## Astroya Payload

Use `marketing-ops/apps/astroya/make-payload.json`.

## Cost Guardrails

- Keep `dailyVideoCount` at `1`.
- Keep generated videos script-only until manual posts show traction.
- Use one video concept per app per day and cross-post it.
- Do not connect paid video rendering until a weekly review shows the content is worth scaling.
- Do not autopublish until account setup, brand voice, and moderation rules are proven.
