# Make.com Starter Scenario

## Goal

Create one daily video package per app for YouTube Shorts, Instagram Reels, and Facebook Reels while keeping costs minimal.

The repo now generates the MP4s itself, so Make only needs to receive the bundle and route it to the correct social accounts.

## Current Auto-Publishing Flow

```text
GitHub/Codex schedule
-> npm run marketing:render-videos
-> npm run marketing:publish-social-videos
-> Make Custom Webhook
-> Router by appId
-> YouTube Shorts / Instagram Reels / Facebook
```

The webhook payload includes:

- `appId`
- `productName`
- `platforms`
- `title`
- `description`
- `caption`
- `hashtags`
- `targetUrl`
- `files.video.base64`
- `files.video.fileName`
- `files.video.mimeType`
- `files.cover.base64`
- `files.cover.fileName`
- `files.caption.text`

## Required GitHub or Local Environment Values

```text
MAKE_SOCIAL_WEBHOOK_URL
MAKE_SOCIAL_WEBHOOK_TOKEN
SOCIAL_AUTO_POST=true
```

Keep `SOCIAL_AUTO_POST=false` until the Make scenario receives a test bundle and routes it to the correct brand accounts.

When API-key authentication is enabled on the Make Custom Webhook, set the same value in `MAKE_SOCIAL_WEBHOOK_TOKEN`. The publisher sends it through Make's native `x-make-apikey` header.

## Modules

1. Custom Webhook
   - Create a new custom webhook.
   - Optional but recommended: enable API-key authentication.
   - Copy the webhook URL into `MAKE_SOCIAL_WEBHOOK_URL`.
   - Run `npm run marketing:render-videos` and `npm run marketing:publish-social-videos` once so Make can detect the payload schema.

2. Router
   - Branch 1 filter: `appId` equals `daily-paper`.
   - Branch 2 filter: `appId` equals `astroya`.

3. Decode Video
   - Decode `files.video.base64`.
   - File name: `files.video.fileName`.
   - MIME type: `files.video.mimeType`.

4. Decode Cover
   - Decode `files.cover.base64`.
   - File name: `files.cover.fileName`.
   - MIME type: `files.cover.mimeType`.

5. Platform Routes
   - YouTube Shorts: upload decoded video, title from `title`, description from `description`.
   - Instagram Reels: upload decoded video, caption from `caption`.
   - Facebook Reels/Page video: upload decoded video, caption from `caption`.

6. Posting Log
   - Store `appId`, `title`, `platform`, `targetUrl`, posted URL, status, and timestamp in Google Sheets or Make Data Store.

## Brand Routing

Use separate Make connections for each brand:

- Daily Paper: `marketing-ops/apps/daily-paper/profile.json`
- Astroya: `marketing-ops/apps/astroya/profile.json`

## Cost Guardrails

- Keep `dailyVideoCount` at `1`.
- Use one video concept per app per day and cross-post it.
- Do not connect paid video rendering until a weekly review shows the content is worth scaling.
- Keep the current local renderer unless a paid video model clearly improves conversions.
