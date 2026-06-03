# Separate Social Account Plan

## Daily Paper

- YouTube channel: `Daily Paper AI`
- YouTube status: created
- YouTube channel ID: `UC4ecXk84jfrVvXhxecJXYUA`
- YouTube Studio: `https://studio.youtube.com/channel/UC4ecXk84jfrVvXhxecJXYUA`
- YouTube public URL: `https://www.youtube.com/channel/UC4ecXk84jfrVvXhxecJXYUA`
- Handle candidates: `@DailyPaperAI`, `@DailyPaperNews`, `@DailyPaperBrief`
- Instagram candidates: `@dailypaper.ai`, `@dailypaperbrief`, `@daily.paper.ai`
- Facebook page: `Daily Paper AI`
- Bio: `Your personalized AI daily paper. Choose topics, get a cleaner briefing, and read without the scroll.`
- Link: `https://dailynews-theta-ten.vercel.app/signup`

## Astroya SoulPath

- YouTube channel: `Astroya SoulPath`
- YouTube status: created
- YouTube channel ID: `UCvyD42R6KpG-wobER_JH3HQ`
- YouTube Studio: `https://studio.youtube.com/channel/UCvyD42R6KpG-wobER_JH3HQ`
- YouTube public URL: `https://www.youtube.com/channel/UCvyD42R6KpG-wobER_JH3HQ`
- Handle candidates: `@AstroyaSoulPath`, `@AstroyaApp`, `@MySoulPathGuide`
- Instagram candidates: `@astroya.soulpath`, `@astroya.app`, `@mysoulpathguide`
- Facebook page: `Astroya SoulPath`
- Bio: `Astrology, palmistry, and reflective AI guidance for calmer self-discovery.`
- Link: `https://www.astroya.ca/signup`

## Creation Order

1. Create a dedicated Google account for each YouTube channel or decide which existing Google account owns them.
2. Create or convert an Instagram account for each app.
3. Create a Facebook page for each app, owned by the correct Meta profile/business manager.
4. Connect Instagram and Facebook pages inside Meta.
5. Connect YouTube, Instagram, and Facebook to n8n.
6. Add the n8n webhook URL as `N8N_SOCIAL_WEBHOOK_URL`.
7. Set `SOCIAL_AUTO_POST=true` only after the test webhook receives one Daily Paper and one Astroya bundle correctly.

## Posting Guardrail

The code can auto-send video bundles to n8n or Make, but the router should stay disconnected from public posting until the correct app-specific accounts are connected. Once the routing is verified, `SOCIAL_AUTO_POST=true` turns on scheduled social publishing.
