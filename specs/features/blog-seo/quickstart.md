# Quickstart - Blog + SEO Pages

## Goal
Validate the Phase 1 implementation slice for blog-seo.

## Prerequisites
- Node.js 22 and pnpm/npm installed
- Firebase project + emulators configured
- Confirm upstream services provide required authenticated artifacts and trusted service identity context.

## Steps
1. Load fixtures relevant to blog-seo from local emulator data.
2. Run feature unit tests.
3. Run integration tests against Firebase emulator suite.
4. Run Playwright scenario covering primary acceptance flow.
5. Inspect audit/telemetry logs for privacy-safe events only.

## Verification
- Core acceptance scenario passes for blog-seo.
- Constitution gates remain satisfied (trust, privacy/consent, design, verification).
- No sensitive data appears in logs.

## Local SPA Route Coverage
- `/blog` now renders a dark neon public blog index with published entries and pagination.
- `/blog?tag=...` supports topic discovery in the local SPA.
- `/blog/:slug` renders published post content or a not-found state.
- Verified on 2026-06-02 with `npm run build`, `npm run test:unit`, `npm run test:integration`, and `npm run test:e2e`.

## Make.com Starter Campaign
- Use `POST /api/marketing/make-campaign` with `Authorization: Bearer NEWSLETTER_ADMIN_TOKEN`.
- Start with this body:

```json
{
  "appId": "daily-paper",
  "productName": "Daily Paper",
  "strategy": "minimal-cost",
  "platforms": ["blog", "instagram-reels", "youtube-shorts", "facebook-reels"],
  "dailyVideoCount": 1,
  "topic": "why a personalized daily news briefing helps people make better everyday decisions",
  "audience": "young professionals and students who want useful news without scrolling",
  "sampleRoute": "/samples/ai-daily-paper",
  "ctaRoute": "/signup"
}
```

- Recommended first Make scenario: Scheduler -> HTTP -> Google Sheets/Airtable/Notion draft storage -> Email/Slack approval digest -> draft rows per platform.
- Keep publishing in review mode and keep video briefs script-only until weekly performance justifies paid rendering or direct social scheduling.
- The same scenario can be duplicated for Astoria after Daily Paper runs reliably for one week.
