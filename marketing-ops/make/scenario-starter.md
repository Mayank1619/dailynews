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

```json
{
  "appId": "daily-paper",
  "productName": "Daily Paper",
  "positioning": "A personalized AI daily paper for readers who want useful news without the scroll.",
  "strategy": "minimal-cost",
  "platforms": ["youtube-shorts", "instagram-reels", "facebook-reels"],
  "dailyVideoCount": 1,
  "topic": "why a personalized daily news briefing helps people make better everyday decisions",
  "audience": "young professionals and students who want useful news without scrolling",
  "newsletterThemes": ["source-linked AI summaries", "topic preferences", "15-day free trial", "daily or weekly delivery"],
  "baseUrl": "https://dailynews-theta-ten.vercel.app",
  "sampleRoute": "/samples/ai-daily-paper",
  "ctaRoute": "/signup"
}
```

## Astroya Payload

```json
{
  "appId": "astroya",
  "productName": "Astroya SoulPath",
  "positioning": "A calm astrology and palmistry guidance experience for reflective self-discovery.",
  "strategy": "minimal-cost",
  "platforms": ["youtube-shorts", "instagram-reels", "facebook-reels"],
  "dailyVideoCount": 1,
  "topic": "why personalized astrology and palmistry guidance helps people reflect with more clarity",
  "audience": "spiritually curious adults who want a calm personal guidance flow",
  "newsletterThemes": ["Vedic astrology", "Western astrology", "palmistry", "AI-powered consultation"],
  "baseUrl": "https://www.astroya.ca",
  "sampleRoute": "/how-it-works",
  "ctaRoute": "/signup"
}
```

## Cost Guardrails

- Keep `dailyVideoCount` at `1`.
- Keep generated videos script-only until manual posts show traction.
- Use one video concept per app per day and cross-post it.
- Do not connect paid video rendering until a weekly review shows the content is worth scaling.
- Do not autopublish until account setup, brand voice, and moderation rules are proven.
