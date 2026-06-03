# Marketing Operations Workspace

This folder keeps the low-cost marketing framework for Daily Paper and Astroya SoulPath.

## Current Strategy

- Keep each app as a separate brand profile, social account set, and draft queue.
- Auto-publish owned website blog posts.
- Auto-publish social videos only when the social webhook and explicit posting secret are configured.
- Generate one reusable script-only video brief per app per day.
- Cross-post the same short concept across platforms before paying for video rendering.
- Store local drafts in `draft-queue/` during testing. That folder is ignored by git.
- Use Vercel Cron as the primary scheduler because the app is already hosted on Vercel.
- Prefer n8n as the repeatable social routing layer because workflows can be imported/exported as JSON.
- Treat Make.com, Pipedream, or GitHub Actions as optional routing layers, not the core marketing brain.

## Primary No-Cost Automation

The scalable starter flow is:

```text
Vercel Cron -> /api/marketing/automation-run -> GitHub Action -> generated blog post commit -> Vercel redeploy
```

The cron is configured in `vercel.json`:

```json
{
  "path": "/api/marketing/automation-run",
  "schedule": "0 10 * * *"
}
```

Set `CRON_SECRET` in Vercel so scheduled requests are authenticated. Vercel sends it as:

```text
Authorization: Bearer CRON_SECRET
```

Manual admin runs use:

```text
POST https://dailynews-theta-ten.vercel.app/api/marketing/automation-run
Authorization: Bearer NEWSLETTER_ADMIN_TOKEN
Content-Type: application/json
```

Example body:

```json
{
  "appIds": ["daily-paper", "astroya"],
  "provider": "manual",
  "mode": "auto-publish-owned-sites"
}
```

Daily Paper blog autopublishing is handled by `.github/workflows/auto-publish-daily-paper-blog.yml`.
The workflow runs `npm run marketing:publish-blog`, updates `apps/web/src/app/blog/generated-posts.ts`, commits the generated post, and lets Vercel deploy the new public blog page.

Optional GitHub secret for AI-backed generation through the production endpoint:

```text
NEWSLETTER_ADMIN_TOKEN
```

If the secret is absent, the workflow still publishes a deterministic Daily Paper blog post so the SEO engine keeps moving at $0 cost.

Social platforms are not posted yet because YouTube, Instagram, and Facebook accounts/OAuth connections still need to be connected.

## Apps

- Daily Paper: `apps/daily-paper/profile.json`
- Astroya SoulPath: `apps/astroya/profile.json`

## Make.com Optional Scenario

Use `make/scenario-starter.md`.

The scenario should call:

```text
POST https://dailynews-theta-ten.vercel.app/api/marketing/make-campaign
Authorization: Bearer NEWSLETTER_ADMIN_TOKEN
Content-Type: application/json
```

Start with Daily Paper, then duplicate the scenario for Astroya after account connections are stable.

Make is optional now. It is useful later for approvals and routing, but the app can generate the draft assets without relying on Make's visual editor.

## Local Draft Generation

When `NEWSLETTER_ADMIN_TOKEN` is available in the shell, generate local draft payloads with:

```bash
node marketing-ops/scripts/generate-local-drafts.mjs
```

Generate one app only:

```bash
node marketing-ops/scripts/generate-local-drafts.mjs daily-paper
node marketing-ops/scripts/generate-local-drafts.mjs astroya
```

The generated JSON files are stored in `marketing-ops/draft-queue/` and ignored by git.

## Free Video Rendering

Generate vertical MP4 marketing videos locally with:

```bash
npm run marketing:render-videos
```

Generate one app only:

```bash
npm run marketing:render-videos -- daily-paper
npm run marketing:render-videos -- astroya
```

The renderer creates:

- `marketing-ops/generated-videos/{app}-{date}-15s.mp4`
- `marketing-ops/generated-videos/{app}-{date}-15s-cover.png`
- `marketing-ops/generated-videos/{app}-{date}-15s-caption.txt`
- `marketing-ops/generated-videos/{app}-{date}-15s.json`

The renderer uses local templates, Playwright screenshots, and a bundled ffmpeg binary. It does not use paid video generation.

## Campaign Assets

Generate daily Facebook organic copy, YouTube/Instagram captions, SEO snippets, and Facebook ad drafts with:

```bash
npm run marketing:campaign-assets
```

Generate one app only:

```bash
npm run marketing:campaign-assets -- daily-paper
npm run marketing:campaign-assets -- astroya
```

The generated campaign packs are stored locally in:

```text
marketing-ops/campaign-assets/
```

Each pack includes:

- video file paths
- Facebook Reel post copy
- Facebook text-link post copy
- YouTube Shorts title and description
- Instagram Reel caption
- Facebook ad draft copy
- SEO title and description snippets
- posting checklist

Paid Facebook ads should stay in `draft-needs-budget` status until a budget, geography, and campaign objective are chosen.

## Social Video Publishing

Prepare upload-ready social bundles with:

```bash
npm run marketing:publish-social-videos
```

Prepare one app only:

```bash
npm run marketing:publish-social-videos -- daily-paper
npm run marketing:publish-social-videos -- astroya
```

The publisher reads the latest generated MP4 metadata and creates ignored local bundles in:

```text
marketing-ops/publish-queue/
```

For n8n posting, import `n8n/social-video-webhook.workflow.json`, activate the production webhook, and add these GitHub repository secrets:

```text
N8N_SOCIAL_WEBHOOK_URL
N8N_SOCIAL_WEBHOOK_TOKEN
N8N_SOCIAL_WEBHOOK_HEADER=X-DailyNews-Token
SOCIAL_AUTO_POST=true
```

`N8N_SOCIAL_WEBHOOK_TOKEN` is optional while testing. When set, it is sent using `N8N_SOCIAL_WEBHOOK_HEADER`, which defaults to `X-DailyNews-Token`.

For Make.com posting, create a Custom Webhook scenario and add these GitHub repository secrets:

```text
MAKE_SOCIAL_WEBHOOK_URL
MAKE_SOCIAL_WEBHOOK_TOKEN
SOCIAL_AUTO_POST=true
```

`MAKE_SOCIAL_WEBHOOK_TOKEN` is optional. When set, it is sent as Make's native `x-make-apikey` header for Custom Webhook API-key authentication.

Make Custom Webhooks currently allow a 5 MB maximum request payload. The current generated videos are intentionally small, usually under 1 MB including video, cover, caption, and metadata, so the JSON webhook route should stay inside the limit.

The scheduled GitHub workflow is `.github/workflows/publish-social-videos.yml`. It renders videos, creates social bundles, and sends them to n8n when `SOCIAL_AUTO_POST=true` and `N8N_SOCIAL_WEBHOOK_URL` are present. It falls back to Make when `MAKE_SOCIAL_WEBHOOK_URL` is present. Without those secrets it still produces GitHub artifacts for manual inspection.

Expected n8n routing:

```text
Webhook -> route by appId -> YouTube Shorts
                        -> Instagram Reels
                        -> Facebook Reels/Page video
```

Expected Make routing:

```text
Custom webhook -> decode video base64 -> YouTube Shorts
               -> decode video base64 -> Instagram Reels
               -> decode video base64 -> Facebook Reels/Page video
```

Use separate Make connections for Daily Paper and Astroya so each app posts to its own channels/pages.

## External Accounts

Separate accounts should be created for each app:

- YouTube channel
- Instagram business or creator account
- Facebook page

Account creation and final publishing require user confirmation because they create or modify persistent external accounts.
