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

### Implemented Marketing Agent

Completed on 2026-06-02:

- `POST /api/marketing/daily-content` creates a daily SEO blog draft and 10-second, 15-second, and 30-second short-video scripts.
- The endpoint is protected by the existing `NEWSLETTER_ADMIN_TOKEN` bearer-token guard.
- The agent uses `OPENAI_MARKETING_MODEL` or `gpt-4.1-mini` when `OPENAI_API_KEY` is available, with deterministic fallback content if AI generation is unavailable.
- Output includes captions, hashtags, review checklist, channel recommendations, signup/sample routes, and automation notes.
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
