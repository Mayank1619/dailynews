# Marketing Operations Workspace

This folder keeps the low-cost marketing framework for Daily Paper and Astroya SoulPath.

## Current Strategy

- Keep each app as a separate brand profile, social account set, and draft queue.
- Start with review-only drafts for YouTube, Instagram, and Facebook.
- Generate one reusable script-only video brief per app per day.
- Cross-post the same approved short concept across platforms before paying for video rendering.
- Store local drafts in `draft-queue/` during testing. That folder is ignored by git.
- Use Vercel Cron as the primary scheduler because the app is already hosted on Vercel.
- Treat Make.com, Pipedream, n8n, or GitHub Actions as optional routing layers, not the core marketing brain.

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

## External Accounts

Separate accounts should be created for each app:

- YouTube channel
- Instagram business or creator account
- Facebook page

Account creation and final publishing require user confirmation because they create or modify persistent external accounts.
