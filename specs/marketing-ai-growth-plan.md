# Daily Paper AI-Led SEO and Organic Marketing Plan

**Date**: 2026-06-02

## Goal

Grow Daily Paper organically without paid ads by turning the newsletter engine into a repeatable content factory:

- AI-generated SEO blog posts
- Public sample newsletters
- Short-form videos for Instagram Reels, Facebook Reels, YouTube Shorts, and TikTok-style reposting
- Social captions and launch hooks
- Weekly measurement and iteration

## Positioning

Daily Paper is a personalized AI morning paper. Users choose topics, region, frequency, and delivery time; the app generates a source-linked newsletter that cuts through news overload.

Primary promise:

> Your news, chosen by you, summarized by AI, delivered like a daily paper.

## Subscription Recommendation

Launch pricing:

- **15-day free trial**
- **$4.99/month**
- **$49/year**

Rationale:

- Daily AI generation on `gpt-4.1-mini` is expected to be low cost per user when prompts stay compact.
- Brevo has a generous free sending tier for early volume, then low-cost paid sending tiers.
- Stripe-style payment fees include a fixed per-transaction cost, so prices below roughly $3/month lose too much margin.
- $4.99/month is low enough for consumer newsletter utility and high enough to cover AI, email, support, and churn.

Suggested future tiers:

| Tier | Price | Audience | Entitlements |
| --- | ---: | --- | --- |
| Trial | $0 for 15 days | New users | Full Plus experience |
| Plus Monthly | $4.99/mo | Casual users | Personalized AI newsletter, source-linked summaries, history |
| Plus Annual | $49/yr | Committed users | Same as Plus, two months discount |
| Family/Team | Later | Households/small teams | Multiple profiles, shared billing |

## Automated SEO Engine

### Vercel Cron Starter Framework

Added on 2026-06-03:

- `GET /api/marketing/automation-run` is the primary no-cost scheduled marketing endpoint.
- `POST /api/marketing/automation-run` lets the admin run the same batch manually from the Growth tab.
- The scheduled route is protected by `CRON_SECRET`; Vercel sends it as an `Authorization: Bearer ...` header.
- The manual route is protected by `NEWSLETTER_ADMIN_TOKEN`.
- `vercel.json` schedules the route once daily at `0 10 * * *`.
- The automation creates owned-site autopublish campaign kits for Daily Paper and Astroya SoulPath.
- Output includes a $0 starter cost model, Vercel Cron/GitHub Actions scheduler recommendation, app-specific generated asset counts, publishing instructions, and social-platform connection safeguards.
- `/admin` Growth now includes a "Run Auto-Publish Batch" button for a browser-based manual run.
- `.github/workflows/auto-publish-daily-paper-blog.yml` commits generated Daily Paper blog posts into `apps/web/src/app/blog/generated-posts.ts`, triggering Vercel to publish the public blog page.

This is now the preferred scalable starter path because it avoids fragile visual scenario editors and keeps the marketing brain inside the application code. Make.com remains optional for routing generated assets to spreadsheets, Slack/email, or later platform integrations.

### Make.com Optional Framework

Added on 2026-06-03:

- `POST /api/marketing/make-campaign` returns a Make.com-ready campaign kit for Daily Paper.
- The route is protected by the same `NEWSLETTER_ADMIN_TOKEN` bearer-token guard as the marketing generator.
- The default scenario is designed for low cost: one daily Scheduler run, one HTTP request into the app, one storage row, one approval digest, and draft rows per platform.
- Default platforms are Blog, Instagram Reels, YouTube Shorts, and Facebook Reels.
- The starter flow creates script-only video briefs and captions. It does not call a paid video rendering provider.
- The response includes Make scenario steps, estimated monthly operations, setup checklist, social draft queue, script-only video briefs, cost guardrails, and required inputs.
- `/admin` Growth now includes a "Generate Make.com Campaign Kit" button so the operator can create the first campaign payload from the browser.

Daily Paper should be the first app profile. After one week of successful drafts and signup-source tracking, duplicate the Make scenario for Astoria and change only the app profile, routes, brand voice, and sample content.

Updated on 2026-06-03:

- The Make campaign endpoint now supports product-specific profiles, including Astroya SoulPath.
- `/admin` Growth includes a marketing app selector for Daily Paper and Astroya SoulPath.
- Local marketing operations files live in `marketing-ops/`.
- Draft output can be stored locally in `marketing-ops/draft-queue/`; that folder is gitignored for generated data.
- Separate YouTube, Instagram, and Facebook accounts should be created for each app before Make.com publishing is enabled.
- Account creation, external permissions, and final posting remain confirmation-required browser actions.

### Minimal Make.com Scenario

1. Scheduler: run once daily.
2. HTTP: `POST https://dailynews-theta-ten.vercel.app/api/marketing/make-campaign`.
3. Header: `Authorization: Bearer {{NEWSLETTER_ADMIN_TOKEN}}`.
4. Body: product profile, topic, audience, platform list, `dailyVideoCount: 1`.
5. Store: create rows in Google Sheets, Airtable, or Notion.
6. Approval: send owner a daily digest by email or Slack.
7. Publishing: keep posts in draft/review until direct platform posting is explicitly enabled.

Astroya profile:

- Product: Astroya SoulPath
- URL: `https://www.astroya.ca`
- Positioning: calm astrology and palmistry guidance for reflective self-discovery
- Platforms: YouTube Shorts, Instagram Reels, Facebook Reels/Page
- Safety rule: avoid guaranteed predictions and frame content as reflection, not medical, financial, legal, or relationship certainty.

Cost control:

- Let the app endpoint do AI generation so Make only routes payloads.
- Cross-post one reusable video concept per day instead of generating unique videos per platform.
- Keep video rendering manual or Canva/CapCut-template based until the first two weeks of organic performance are measured.
- Add Buffer, Metricool, Later, or native social modules only after the draft queue proves useful.

### Implemented Marketing Agent

Completed on 2026-06-02:

- `POST /api/marketing/daily-content` creates a daily SEO blog draft and 10-second, 15-second, and 30-second short-video scripts.
- The endpoint is protected by the existing `NEWSLETTER_ADMIN_TOKEN` bearer-token guard.
- The agent uses `OPENAI_MARKETING_MODEL` or `gpt-4.1-mini` when `OPENAI_API_KEY` is available, with deterministic fallback content if AI generation is unavailable.
- Output includes captions, hashtags, review checklist, channel recommendations, signup/sample routes, and automation notes.
- `/admin` now exposes the AI Marketing Agent in the Growth tab so an operator can enter the admin token, choose a topic/audience, generate the kit, and review the output without using a terminal.
- This is a draft-generation flow, not direct public publishing. A persistent blog store and admin review/publish action are still required before fully automatic daily publishing.

### Blog Cadence

Publish **3 posts/week**:

1. Monday: "What changed in AI this week"
2. Wednesday: Topic-specific evergreen article
3. Friday: Sample newsletter or weekend digest preview

### Blog Categories

- AI and technology
- Politics and world affairs
- Markets and personal finance
- Sports briefings
- Culture and horoscopes
- Local Canada news
- Productivity and news habits

### Blog Generation Workflow

1. Pick topic from trending newsletter preferences.
2. Generate outline with search intent, title, meta description, and internal links.
3. Draft post from approved source summaries only.
4. Add a sample Daily Paper section.
5. Add CTA to `/signup` and sample newsletter pages.
6. Publish as `published` only after automated checks pass.

Automated checks:

- No invented source claims
- Title under 60 characters where possible
- Meta description under 155 characters
- One canonical URL
- Internal link to signup
- Includes product explanation
- No misleading financial, medical, legal, or political certainty language

## Sample Newsletter Library

Create public sample pages:

- `/samples/ai-daily-paper` - implemented
- `/samples/markets-daily-paper` - implemented
- `/samples/sports-daily-paper` - implemented
- `/samples/politics-daily-paper` - implemented
- `/samples/horoscope-culture-paper` - implemented
- `/samples/local-canada-paper` - implemented

Each sample should include:

- Topic chips
- Generation date
- Source labels
- 3-6 summarized stories
- CTA: "Create my Daily Paper"
- Short disclaimer: sample content, not personalized live advice

## Short-Form Video Plan

Publish **4 short videos/week**, 20-40 seconds each.

Implemented on 2026-06-03:

- `npm run marketing:render-videos` renders free 9:16 MP4 videos for Daily Paper and Astroya.
- The renderer uses Playwright screenshots, local HTML/CSS templates, and a bundled ffmpeg binary.
- Output is written to `marketing-ops/generated-videos/` as MP4, cover PNG, caption TXT, and metadata JSON files.
- `.github/workflows/render-marketing-videos.yml` can render the same videos daily and upload them as GitHub Actions artifacts.
- No paid video generation provider is required for the starter version.

### Repeatable Video Formats

1. Problem hook:
   - "You do not need 12 news apps every morning."
   - Show cluttered news feed, then Daily Paper preferences and inbox result.

2. Product demo:
   - "Choose AI, markets, sports, and horoscopes. Get one clean paper."
   - Show topic chips, delivery time, generated paper.

3. Sample newsletter:
   - "Here is what an AI daily paper looks like."
   - Show one sample issue with source labels.

4. Trust angle:
   - "AI summaries should show sources."
   - Show source-linked story cards.

5. Subscription/trial:
   - "Try your personalized daily paper free for 15 days."
   - Show pricing page and trial badge.

### Weekly Publishing Schedule

| Day | Asset | Channel |
| --- | --- | --- |
| Monday | AI news short | Instagram, YouTube Shorts, Facebook |
| Tuesday | Blog post caption thread | LinkedIn, Facebook |
| Wednesday | Product demo short | Instagram, YouTube Shorts |
| Thursday | Sample newsletter carousel | Instagram, Facebook |
| Friday | Weekend sports/culture short | Instagram, YouTube Shorts, Facebook |

## AI Content Prompts

### Blog Prompt Template

Generate a 900-1200 word SEO blog post for Daily Paper.

Inputs:

- Topic: `{topic}`
- Audience: busy readers who want useful news without scrolling
- Search intent: `{intent}`
- Source summaries: `{source_summaries}`
- CTA route: `/signup`

Rules:

- Use source summaries only.
- Mention Daily Paper naturally in intro and CTA.
- Include H2 headings.
- Include meta title and meta description.
- Include a sample newsletter block.
- Avoid hype, certainty, and unsupported claims.

### Video Script Prompt Template

Generate a 30-second short-form video script for Daily Paper.

Inputs:

- Theme: `{theme}`
- Feature: `{feature}`
- CTA: "Try Daily Paper free for 15 days"

Output:

- Hook, 0-3 seconds
- Scene list
- Voiceover
- On-screen text
- Caption
- Hashtags

Rules:

- Keep sentences short.
- No fake testimonials.
- No exaggerated claims.
- Use a youthful, direct tone.

## Organic Growth Loop

1. Generate newsletters.
2. Convert best newsletter sections into public samples.
3. Convert samples into blog posts.
4. Convert blog posts into short videos.
5. Link every asset back to signup.
6. Track signup source.
7. Use winning topics to create more newsletters and posts.

## Metrics

Weekly dashboard metrics:

- New signups
- Trial starts
- Trial-to-paid conversion
- Blog impressions
- Blog clicks to signup
- Video views
- Video profile clicks
- Newsletter open rate
- Unsubscribe rate
- Most selected topics

## First 30 Days

Week 1:

- Publish sample newsletter pages. Completed initial public sample library on 2026-06-02.
- Add trial/subscription page.
- Publish first 3 blog posts.
- Publish first 4 short videos.

Week 2:

- Add automated blog draft generation endpoint. Completed first protected draft-generation endpoint on 2026-06-02.
- Start topic-based blog calendar.
- Add signup-source tracking.

Week 3:

- Add sample newsletter CTA blocks to public pages.
- Publish 3 more posts and 4 more videos.
- Review conversion by topic.

Week 4:

- Double down on top two topics.
- Add customer onboarding email sequence.
- Prepare Stripe/Brevo production billing and email settings.
