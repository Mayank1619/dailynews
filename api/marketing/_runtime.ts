export type MarketingSourceSummary = {
  title: string;
  summary: string;
  source: string;
  url?: string;
};

export type MarketingAgentRequest = {
  date?: Date | string;
  productName?: string;
  positioning?: string;
  topic?: string;
  audience?: string;
  newsletterThemes?: string[];
  sourceSummaries?: MarketingSourceSummary[];
  baseUrl?: string;
  sampleRoute?: string;
  ctaRoute?: string;
};

export type GeneratedBlogDraft = {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  bodyMarkdown: string;
  tags: string[];
  category: string;
  targetKeyword: string;
  canonicalPath: string;
  ctaRoute: string;
  sampleRoute: string;
};

export type GeneratedVideoScene = {
  timecode: string;
  visual: string;
  voiceover: string;
  onscreenText: string;
};

export type GeneratedVideoScript = {
  durationSeconds: 10 | 15 | 30;
  title: string;
  hook: string;
  scenes: GeneratedVideoScene[];
  caption: string;
  hashtags: string[];
  targetRoute: string;
};

export type MarketingAgentResult = {
  date: string;
  topic: string;
  audience: string;
  blogDraft: GeneratedBlogDraft;
  videoScripts: GeneratedVideoScript[];
  publishingPlan: {
    recommendedPublishWindow: string;
    reviewChecklist: string[];
    channels: string[];
    automationNotes: string[];
  };
  generation: {
    mode: "ai" | "deterministic-fallback";
    modelName: string;
    sourceCount: number;
  };
};

export type MarketingPlatform = "blog" | "instagram-reels" | "facebook-reels" | "youtube-shorts" | "linkedin";

export type MakeMarketingCampaignRequest = MarketingAgentRequest & {
  appId?: string;
  productName?: string;
  positioning?: string;
  strategy?: "minimal-cost" | "growth";
  platforms?: MarketingPlatform[];
  dailyVideoCount?: number;
};

export type MakeScenarioStep = {
  order: number;
  module: string;
  action: string;
  estimatedOperationsPerRun: number;
  notes: string;
};

export type MakeMarketingCampaignResult = {
  date: string;
  app: {
    appId: string;
    productName: string;
    baseUrl: string;
    positioning: string;
  };
  strategy: "minimal-cost" | "growth";
  contentKit: MarketingAgentResult;
  makeScenario: {
    name: string;
    trigger: string;
    cadence: string;
    monthlyOperationEstimate: number;
    minimumPlanFit: "free-tier-friendly" | "paid-plan-likely";
    steps: MakeScenarioStep[];
    setupChecklist: string[];
  };
  publishingQueue: {
    blogDraft: {
      title: string;
      slug: string;
      targetUrl: string;
      status: "draft";
      destination: string;
    };
    socialPosts: Array<{
      platform: MarketingPlatform;
      format: "blog-link" | "short-video-caption";
      copy: string;
      hashtags: string[];
      targetUrl: string;
      status: "draft";
    }>;
    videoBriefs: Array<{
      platform: Exclude<MarketingPlatform, "blog" | "linkedin">;
      durationSeconds: number;
      title: string;
      hook: string;
      productionMode: "script-only";
      estimatedExternalVideoCostUsd: 0;
    }>;
  };
  costGuardrails: string[];
  requiredUserInputs: string[];
};

export type MarketingAutomationProvider = "vercel-cron" | "github-actions" | "manual" | "pipedream";

export type MarketingAutomationAppId = "daily-paper" | "astroya";

export type MarketingAutomationRunRequest = {
  date?: Date | string;
  appIds?: MarketingAutomationAppId[];
  provider?: MarketingAutomationProvider;
  mode?: "draft-only" | "review-and-schedule";
};

export type MarketingAutomationRunResult = {
  runId: string;
  date: string;
  provider: MarketingAutomationProvider;
  mode: "draft-only" | "review-and-schedule";
  status: "drafts-ready";
  scheduler: {
    recommendedPrimary: "vercel-cron";
    fallback: "github-actions";
    cadence: string;
    reason: string;
  };
  monthlyCostEstimateUsd: {
    scheduler: 0;
    draftStorage: 0;
    videoRendering: 0;
    socialPublishing: 0;
    notes: string[];
  };
  apps: Array<{
    appId: MarketingAutomationAppId;
    productName: string;
    draftCount: number;
    blogSlug: string;
    targetUrl: string;
    campaign: MakeMarketingCampaignResult;
    reviewQueue: {
      destination: string;
      approvalRequired: true;
      publishPolicy: "never-auto-publish";
      suggestedOwnerAction: string;
    };
  }>;
  safeguards: string[];
  nextActions: string[];
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{ content?: Array<{ text?: string }> }>;
};

type AiMarketingPayload = {
  blogDraft?: GeneratedBlogDraft;
  videoScripts?: GeneratedVideoScript[];
  publishingPlan?: MarketingAgentResult["publishingPlan"];
};

const DEFAULT_PRODUCT_NAME = "Daily Paper";
const DEFAULT_POSITIONING = "A personalized AI daily paper for readers who want useful news without the scroll.";
const DEFAULT_TOPIC = "why reading a short daily news briefing helps people make better everyday decisions";
const DEFAULT_AUDIENCE = "busy young professionals and students who want useful news without doomscrolling";
const DEFAULT_THEMES = ["personalized AI morning paper", "source-linked summaries", "15-day free trial", "daily or weekly delivery"];
const DEFAULT_BASE_URL = "https://dailynews-theta-ten.vercel.app";
const DEFAULT_SAMPLE_ROUTE = "/samples/ai-daily-paper";
const DEFAULT_CTA_ROUTE = "/signup";
const VIDEO_DURATIONS = [10, 15, 30] as const;
const DEFAULT_MARKETING_PLATFORMS: MarketingPlatform[] = ["blog", "instagram-reels", "youtube-shorts", "facebook-reels"];
const MARKETING_AUTOMATION_PROFILES: Record<MarketingAutomationAppId, Required<MarketingAgentRequest> & { appId: MarketingAutomationAppId }> = {
  "daily-paper": {
    appId: "daily-paper",
    date: new Date(),
    productName: "Daily Paper",
    positioning: DEFAULT_POSITIONING,
    topic: "why a personalized daily news briefing helps people make better everyday decisions",
    audience: "young professionals and students who want useful news without scrolling",
    newsletterThemes: ["source-linked AI summaries", "topic preferences", "15-day free trial", "daily or weekly delivery"],
    sourceSummaries: [],
    baseUrl: DEFAULT_BASE_URL,
    sampleRoute: DEFAULT_SAMPLE_ROUTE,
    ctaRoute: DEFAULT_CTA_ROUTE
  },
  astroya: {
    appId: "astroya",
    date: new Date(),
    productName: "Astroya SoulPath",
    positioning: "A calm astrology and palmistry guidance experience for people who want reflective self-discovery without generic horoscope noise.",
    topic: "why personalized astrology and palmistry guidance helps people reflect with more clarity",
    audience: "spiritually curious adults who want a calm, personal astrology and palmistry experience",
    newsletterThemes: ["Vedic and Western astrology", "palmistry-assisted reflection", "birth details", "AI-powered consultation"],
    sourceSummaries: [],
    baseUrl: "https://www.astroya.ca",
    sampleRoute: "/how-it-works",
    ctaRoute: "/signup"
  }
};

export async function generateDailyMarketingContent(request: MarketingAgentRequest = {}): Promise<MarketingAgentResult> {
  const normalized = normalizeRequest(request);
  const modelName = process.env.OPENAI_MARKETING_MODEL ?? "gpt-4.1-mini";
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return buildFallbackMarketingContent(normalized, modelName);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelName,
        instructions: [
          `Create one SEO blog draft and three short-form video scripts for ${normalized.productName}.`,
          "Use source summaries only for factual current claims. If sources are absent, write evergreen product education.",
          "Avoid hype, fake testimonials, invented metrics, and unsupported financial, political, legal, or medical certainty.",
          "For wellness, spirituality, astrology, or palmistry products, frame output as reflective entertainment and self-discovery, not medical, financial, or guaranteed life advice.",
          "Return valid JSON only."
        ].join(" "),
        input: buildCompactMarketingPrompt(normalized),
        max_output_tokens: 2200,
        text: {
          format: {
            type: "json_schema",
            name: "daily_paper_marketing_content",
            strict: true,
            schema: marketingJsonSchema()
          }
        }
      })
    });

    if (!response.ok) {
      return buildFallbackMarketingContent(normalized, modelName);
    }

    const payload = (await response.json()) as OpenAIResponse;
    const parsed = JSON.parse(extractOutputText(payload)) as AiMarketingPayload;
    const result = sanitizeAiPayload(parsed, normalized, modelName);

    if (!result.blogDraft.title || result.videoScripts.length !== VIDEO_DURATIONS.length) {
      return buildFallbackMarketingContent(normalized, modelName);
    }

    return {
      ...result,
      generation: {
        mode: "ai",
        modelName,
        sourceCount: normalized.sourceSummaries.length
      }
    };
  } catch {
    return buildFallbackMarketingContent(normalized, modelName);
  }
}

export async function generateMakeMarketingCampaign(request: MakeMarketingCampaignRequest = {}): Promise<MakeMarketingCampaignResult> {
  const normalized = normalizeCampaignRequest(request);
  const contentKit = await generateDailyMarketingContent({
    ...request,
    audience: normalized.audience,
    baseUrl: normalized.baseUrl,
    ctaRoute: normalized.ctaRoute,
    date: normalized.date,
    positioning: normalized.positioning,
    productName: normalized.productName,
    sampleRoute: normalized.sampleRoute,
    topic: normalized.topic
  });

  return buildMakeMarketingCampaign(normalized, contentKit);
}

export async function generateMarketingAutomationRun(
  request: MarketingAutomationRunRequest = {}
): Promise<MarketingAutomationRunResult> {
  const date = request.date ? new Date(request.date) : new Date();
  const dateKey = date.toISOString().slice(0, 10);
  const appIds = normalizeAutomationAppIds(request.appIds);
  const provider = request.provider ?? "vercel-cron";
  const mode = request.mode ?? "draft-only";
  const campaigns = await Promise.all(
    appIds.map((appId) => {
      const profile = MARKETING_AUTOMATION_PROFILES[appId];
      return generateMakeMarketingCampaign({
        ...profile,
        date,
        appId,
        strategy: "minimal-cost",
        platforms: DEFAULT_MARKETING_PLATFORMS,
        dailyVideoCount: 1
      });
    })
  );

  return {
    runId: `marketing-${dateKey}-${appIds.join("-")}`,
    date: dateKey,
    provider,
    mode,
    status: "drafts-ready",
    scheduler: {
      recommendedPrimary: "vercel-cron",
      fallback: "github-actions",
      cadence: "Once daily at 10:00 UTC for draft generation, then human review before anything goes public.",
      reason: "The app already runs on Vercel, so the cheapest scalable scheduler is a Vercel Cron GET request into this API."
    },
    monthlyCostEstimateUsd: {
      scheduler: 0,
      draftStorage: 0,
      videoRendering: 0,
      socialPublishing: 0,
      notes: [
        "Use Vercel Cron or a GitHub Actions scheduled workflow for the trigger.",
        "Use function logs and admin JSON review first; add Firestore draft persistence after the review columns are final.",
        "Keep video generation script-only until paid rendering has a measured conversion case.",
        "Keep social publishing manual or draft-only until account OAuth and approval rules are tested."
      ]
    },
    apps: campaigns.map((campaign, index) => ({
      appId: appIds[index],
      productName: campaign.app.productName,
      draftCount: 1 + campaign.publishingQueue.socialPosts.length + campaign.publishingQueue.videoBriefs.length,
      blogSlug: campaign.publishingQueue.blogDraft.slug,
      targetUrl: campaign.publishingQueue.blogDraft.targetUrl,
      campaign,
      reviewQueue: {
        destination: `${campaign.app.productName} admin Growth tab and local draft queue`,
        approvalRequired: true,
        publishPolicy: "never-auto-publish",
        suggestedOwnerAction: "Review the blog, caption, hashtags, and script brief before copying into any social platform."
      }
    })),
    safeguards: [
      "The automation only creates drafts and script briefs.",
      "No public post, scheduled post, account creation, or OAuth permission is triggered by this endpoint.",
      "Astroya content stays framed as reflection and self-discovery, not guaranteed predictions or medical, financial, or legal advice.",
      "Current-event claims must come from supplied source summaries; otherwise content stays evergreen."
    ],
    nextActions: [
      "Add CRON_SECRET to Vercel so the daily cron endpoint can authenticate securely.",
      "Use the Admin Growth tab to run and review the same automation manually.",
      "After one week of drafts, promote the best-performing formats into a Firestore-backed review queue.",
      "Only connect YouTube, Instagram, and Facebook publishing after the draft approval workflow is stable."
    ]
  };
}

export function buildMakeMarketingCampaign(
  request: Required<MakeMarketingCampaignRequest> & { date: Date },
  contentKit: MarketingAgentResult
): MakeMarketingCampaignResult {
  const videoPlatforms = request.platforms.filter(isVideoPlatform);
  const selectedVideoScripts = contentKit.videoScripts.slice(0, Math.max(1, Math.min(request.dailyVideoCount, contentKit.videoScripts.length)));
  const operationEstimate = estimateMonthlyMakeOperations(request.platforms.length, selectedVideoScripts.length);
  const sampleUrl = routeUrl(request.baseUrl, request.sampleRoute);
  const signupUrl = routeUrl(request.baseUrl, request.ctaRoute);
  const blogUrl = routeUrl(request.baseUrl, contentKit.blogDraft.canonicalPath);

  return {
    date: contentKit.date,
    app: {
      appId: request.appId,
      productName: request.productName,
      baseUrl: request.baseUrl,
      positioning: request.positioning
    },
    strategy: request.strategy,
    contentKit,
    makeScenario: {
      name: `${request.productName} daily organic marketing factory`,
      trigger: "Make Scheduler, once per day",
      cadence: "Daily draft generation with human approval before posting",
      monthlyOperationEstimate: operationEstimate,
      minimumPlanFit: operationEstimate <= 1000 ? "free-tier-friendly" : "paid-plan-likely",
      steps: [
        {
          order: 1,
          module: "Scheduler",
          action: "Run once daily during the chosen marketing window.",
          estimatedOperationsPerRun: 1,
          notes: "Start with one daily run for Daily Paper before adding Astoria."
        },
        {
          order: 2,
          module: "HTTP",
          action: "POST to /api/marketing/make-campaign with the admin bearer token.",
          estimatedOperationsPerRun: 1,
          notes: "The app handles OpenAI/fallback generation, so Make does not need a second AI module."
        },
        {
          order: 3,
          module: "Google Sheets or Airtable",
          action: "Store the blog draft, captions, links, and approval status.",
          estimatedOperationsPerRun: 1,
          notes: "Use a lightweight queue first; publishing can be added after the review loop works."
        },
        {
          order: 4,
          module: "Email or Slack",
          action: "Send the daily approval digest to the owner.",
          estimatedOperationsPerRun: 1,
          notes: "This prevents accidental autoposting and keeps quality control cheap."
        },
        {
          order: 5,
          module: "Router",
          action: "Create one draft task per enabled platform.",
          estimatedOperationsPerRun: request.platforms.length,
          notes: "For now, route to draft rows or Buffer queues rather than direct publishing."
        }
      ],
      setupChecklist: [
        "Create a Make scenario with Scheduler, HTTP, storage, approval digest, and platform draft routes.",
        "Set the HTTP Authorization header to Bearer NEWSLETTER_ADMIN_TOKEN.",
        "Create storage columns for app, date, blog title, slug, social caption, platform, approval status, and posted URL.",
        "Keep video rendering off until the first week of captions and scripts performs well.",
        "After Daily Paper is stable, duplicate the scenario and switch the app profile to Astoria."
      ]
    },
    publishingQueue: {
      blogDraft: {
        title: contentKit.blogDraft.title,
        slug: contentKit.blogDraft.slug,
        targetUrl: blogUrl,
        status: "draft",
        destination: `${request.productName} blog admin queue`
      },
      socialPosts: request.platforms.flatMap((platform) => buildSocialPosts(platform, contentKit, sampleUrl, signupUrl, request.productName)),
      videoBriefs: videoPlatforms.flatMap((platform) =>
        selectedVideoScripts.map((script) => ({
          platform,
          durationSeconds: script.durationSeconds,
          title: script.title,
          hook: script.hook,
          productionMode: "script-only" as const,
          estimatedExternalVideoCostUsd: 0 as const
        }))
      )
    },
    costGuardrails: [
      `Use the ${request.productName} campaign endpoint payload for AI generation so Make only routes assets.`,
      "Generate one reusable short-video script per day and cross-post it instead of rendering unique videos per platform.",
      "Store drafts in Google Sheets or Airtable before adding paid social schedulers.",
      "Use script-only video briefs until a paid video generation budget is approved.",
      "Review weekly signup source data before increasing daily runs or platform count."
    ],
    requiredUserInputs: [
      "NEWSLETTER_ADMIN_TOKEN in Vercel and Make HTTP headers",
      "A Make.com scenario owner account",
      `A Google Sheet, Airtable base, Notion database, or local queue for ${request.productName} draft storage`,
      `${request.productName} social account access for Instagram, Facebook, YouTube, and LinkedIn when publishing is enabled`,
      "Optional Buffer/Metricool/Later account if direct social scheduling becomes cheaper than native modules"
    ]
  };
}

export function buildCompactMarketingPrompt(request: Required<MarketingAgentRequest> & { date: Date }): string {
  return JSON.stringify({
    date: request.date.toISOString().slice(0, 10),
    product: request.productName,
    positioning: request.positioning,
    topic: request.topic,
    audience: request.audience,
    themes: request.newsletterThemes,
    routes: {
      signup: request.ctaRoute,
      sample: request.sampleRoute,
      baseUrl: request.baseUrl
    },
    requirements: {
      blogWords: "650-850",
      metaDescriptionMaxChars: 155,
      titleMaxChars: 60,
      videoDurationsSeconds: VIDEO_DURATIONS,
      tone: "direct, modern, useful, youthful without slang overload",
      internalLinks: [request.ctaRoute, request.sampleRoute]
    },
    sources: request.sourceSummaries.slice(0, 8).map((source, index) => ({
      i: index + 1,
      t: source.title.slice(0, 140),
      s: source.summary.slice(0, 420),
      src: source.source.slice(0, 80),
      u: source.url
    }))
  });
}

export function buildFallbackMarketingContent(
  request: Required<MarketingAgentRequest> & { date: Date },
  modelName = "deterministic"
): MarketingAgentResult {
  const date = request.date.toISOString().slice(0, 10);
  const keyword = keywordFromTopic(request.topic);
  const productName = request.productName;
  const isDailyPaper = productName.toLowerCase().includes("daily paper");
  const title = isDailyPaper ? "How a Daily News Habit Helps You Make Better Decisions" : `How ${productName} Turns Curiosity Into Reflection`;
  const slugValue = `${slug(keyword)}-${date}`;
  const sampleUrl = routeUrl(request.baseUrl, request.sampleRoute);
  const signupUrl = routeUrl(request.baseUrl, request.ctaRoute);
  const sourceBlock = renderSourceBlock(request.sourceSummaries);
  const themeSentence = request.newsletterThemes.slice(0, 4).join(", ");
  const habitLine = isDailyPaper
    ? "Most people do not need more noise in the morning. They need a smaller, clearer briefing that helps them understand what changed, what matters, and what they can ignore for now."
    : "Most people do not need a louder feed when they are looking for meaning. They need a calmer way to reflect, notice patterns, and decide what they want to explore next.";
  const productLine = isDailyPaper
    ? "Daily Paper is built around that idea. Readers choose the topics they care about, such as AI, technology, politics, markets, sports, culture, horoscopes, and local news. The product then turns those preferences into a concise paper-style briefing with source-linked summaries."
    : `${productName} is built around that idea. Visitors can explore astrology, palmistry, birth details, and AI-assisted reflection in a calm experience that frames guidance as self-discovery rather than certainty.`;
  const ctaLabel = isDailyPaper ? "Daily Paper samples" : `${productName} experience`;

  return {
    date,
    topic: request.topic,
    audience: request.audience,
    blogDraft: {
      title,
      slug: slugValue,
      metaTitle: title,
      metaDescription: isDailyPaper
        ? "See how a short, personalized Daily Paper briefing can turn news overload into clearer everyday decisions."
        : `See how ${productName} creates a calm, reflective astrology and palmistry experience for self-discovery.`,
      excerpt: isDailyPaper
        ? "A short daily briefing can help readers stay informed without losing the morning to endless feeds."
        : `${productName} gives curious visitors a calmer way to explore astrology, palmistry, and personal reflection.`,
      bodyMarkdown: [
        `# ${title}`,
        "",
        habitLine,
        "",
        productLine,
        "",
        `## Why ${isDailyPaper ? "a shorter briefing" : "a calmer guidance flow"} works`,
        "",
        isDailyPaper
          ? "A focused briefing gives readers a repeatable habit: scan the top changes, understand the context, and move on with the day. That matters for students, founders, professionals, and anyone who wants to sound informed without living inside a feed."
          : "A focused reflection flow gives visitors a repeatable ritual: share the details they are comfortable sharing, read a grounded interpretation, and decide what resonates. It is useful for people who want a softer alternative to generic horoscope content.",
        "",
        `## What ${productName} makes easier`,
        "",
        `The first version of the experience focuses on ${themeSentence}. ${request.positioning}`,
        "",
        sourceBlock,
        "",
        `## A better ${isDailyPaper ? "morning loop" : "reflection loop"}`,
        "",
        isDailyPaper
          ? "Instead of opening several apps, a reader can start with one personalized paper, follow the source links when something matters, and skip the rest. Over time, that creates a calmer relationship with news and a more useful way to keep up."
          : "Instead of bouncing between generic readings, a visitor can move through one guided experience, compare the insight with their own lived context, and continue the conversation when they want deeper reflection.",
        "",
        `## Try ${productName}`,
        "",
        `Start with the [${ctaLabel}](${sampleUrl}), then continue from [${productName} signup](${signupUrl}).`
      ].join("\n"),
      tags: isDailyPaper ? ["daily news", "AI newsletter", "personalized news", "productivity", "news habits"] : ["astrology", "palmistry", "self-discovery", "AI guidance", "spiritual reflection"],
      category: isDailyPaper ? "Productivity and news habits" : "Astrology and self-discovery",
      targetKeyword: keyword,
      canonicalPath: `/blog/${slugValue}`,
      ctaRoute: request.ctaRoute,
      sampleRoute: request.sampleRoute
    },
    videoScripts: VIDEO_DURATIONS.map((duration) => buildFallbackVideo(duration, request)),
    publishingPlan: {
      recommendedPublishWindow: "Schedule the blog for 8:00 AM local time and post the shortest video between 6:00 PM and 9:00 PM.",
      reviewChecklist: [
        "Confirm every current-event claim appears in the supplied source summaries.",
        "Keep the blog title under 60 characters where possible.",
        "Keep the meta description under 155 characters.",
        "Verify links to the signup page and sample newsletter page.",
        "Review captions for exaggerated claims or fake testimonials before posting.",
        "For astrology or palmistry content, avoid guaranteed predictions and keep guidance framed as reflective self-discovery."
      ],
      channels: ["Blog", "Instagram Reels", "YouTube Shorts", "Facebook Reels", "LinkedIn"],
      automationNotes: [
        "This endpoint generates drafts and video scripts; it does not publish blog posts until a persistent blog store is connected.",
        "Rendered videos can be automated later through a chosen video provider or exported into Canva, CapCut, Runway, or a similar workflow.",
        "A nightly job can call this route with the admin token and store the returned JSON for review or publishing."
      ]
    },
    generation: {
      mode: "deterministic-fallback",
      modelName,
      sourceCount: request.sourceSummaries.length
    }
  };
}

function normalizeRequest(request: MarketingAgentRequest): Required<MarketingAgentRequest> & { date: Date } {
  return {
    date: request.date ? new Date(request.date) : new Date(),
    productName: cleanText(request.productName, DEFAULT_PRODUCT_NAME),
    positioning: cleanText(request.positioning, DEFAULT_POSITIONING),
    topic: cleanText(request.topic, DEFAULT_TOPIC),
    audience: cleanText(request.audience, DEFAULT_AUDIENCE),
    newsletterThemes: request.newsletterThemes?.length ? request.newsletterThemes.map((theme) => cleanText(theme, "")).filter(Boolean) : DEFAULT_THEMES,
    sourceSummaries: request.sourceSummaries?.length ? request.sourceSummaries.map(normalizeSource).filter((source) => source.title && source.summary && source.source) : [],
    baseUrl: cleanText(request.baseUrl, DEFAULT_BASE_URL).replace(/\/$/, ""),
    sampleRoute: normalizeRoute(request.sampleRoute, DEFAULT_SAMPLE_ROUTE),
    ctaRoute: normalizeRoute(request.ctaRoute, DEFAULT_CTA_ROUTE)
  };
}

function normalizeCampaignRequest(request: MakeMarketingCampaignRequest): Required<MakeMarketingCampaignRequest> & { date: Date } {
  const normalized = normalizeRequest(request);
  return {
    ...normalized,
    appId: cleanText(request.appId, "daily-paper"),
    productName: normalized.productName,
    positioning: normalized.positioning,
    strategy: request.strategy ?? "minimal-cost",
    platforms: request.platforms?.length ? request.platforms.filter(isKnownPlatform) : DEFAULT_MARKETING_PLATFORMS,
    dailyVideoCount: Math.max(1, Math.min(Number(request.dailyVideoCount ?? 1), 3))
  };
}

function normalizeAutomationAppIds(appIds?: MarketingAutomationAppId[]): MarketingAutomationAppId[] {
  const knownAppIds = Object.keys(MARKETING_AUTOMATION_PROFILES) as MarketingAutomationAppId[];
  const selected = appIds?.filter((appId): appId is MarketingAutomationAppId => knownAppIds.includes(appId)) ?? knownAppIds;
  return Array.from(new Set(selected.length ? selected : knownAppIds));
}

function sanitizeAiPayload(
  payload: AiMarketingPayload,
  request: Required<MarketingAgentRequest> & { date: Date },
  modelName: string
): Omit<MarketingAgentResult, "generation"> & { generation?: MarketingAgentResult["generation"] } {
  const fallback = buildFallbackMarketingContent(request, modelName);
  const blogDraft = payload.blogDraft ?? fallback.blogDraft;
  const canonicalPath = normalizeRoute(blogDraft.canonicalPath, fallback.blogDraft.canonicalPath);
  const videoScripts = VIDEO_DURATIONS.map((duration) => {
    const candidate = payload.videoScripts?.find((script) => script.durationSeconds === duration);
    return candidate ? sanitizeVideo(candidate, request.ctaRoute) : buildFallbackVideo(duration, request);
  });

  return {
    date: request.date.toISOString().slice(0, 10),
    topic: request.topic,
    audience: request.audience,
    blogDraft: {
      title: cleanText(blogDraft.title, fallback.blogDraft.title).slice(0, 90),
      slug: slug(blogDraft.slug || blogDraft.title || fallback.blogDraft.slug),
      metaTitle: cleanText(blogDraft.metaTitle, fallback.blogDraft.metaTitle).slice(0, 70),
      metaDescription: cleanText(blogDraft.metaDescription, fallback.blogDraft.metaDescription).slice(0, 160),
      excerpt: cleanText(blogDraft.excerpt, fallback.blogDraft.excerpt).slice(0, 260),
      bodyMarkdown: cleanText(blogDraft.bodyMarkdown, fallback.blogDraft.bodyMarkdown),
      tags: uniqueStrings(blogDraft.tags).slice(0, 8),
      category: cleanText(blogDraft.category, fallback.blogDraft.category),
      targetKeyword: cleanText(blogDraft.targetKeyword, fallback.blogDraft.targetKeyword),
      canonicalPath,
      ctaRoute: normalizeRoute(blogDraft.ctaRoute, request.ctaRoute),
      sampleRoute: normalizeRoute(blogDraft.sampleRoute, request.sampleRoute)
    },
    videoScripts,
    publishingPlan: payload.publishingPlan ?? fallback.publishingPlan
  };
}

function sanitizeVideo(script: GeneratedVideoScript, defaultRoute: string): GeneratedVideoScript {
  return {
    durationSeconds: script.durationSeconds,
    title: cleanText(script.title, `${DEFAULT_PRODUCT_NAME} ${script.durationSeconds}s short`).slice(0, 80),
    hook: cleanText(script.hook, "Your daily habit does not need to be a scroll session.").slice(0, 160),
    scenes: script.scenes.slice(0, 6).map((scene) => ({
      timecode: cleanText(scene.timecode, "0:00"),
      visual: cleanText(scene.visual, "Show the product interface and sample output."),
      voiceover: cleanText(scene.voiceover, "Choose your path and get a clean result."),
      onscreenText: cleanText(scene.onscreenText, "Your daily habit, simplified.")
    })),
    caption: cleanText(script.caption, "Try a cleaner daily reflection habit.").slice(0, 280),
    hashtags: uniqueStrings(script.hashtags).slice(0, 10),
    targetRoute: normalizeRoute(script.targetRoute, defaultRoute)
  };
}

function buildFallbackVideo(duration: 10 | 15 | 30, request: Required<MarketingAgentRequest> & { date: Date }): GeneratedVideoScript {
  const productName = request.productName;
  const isDailyPaper = productName.toLowerCase().includes("daily paper");
  const topicPicker = isDailyPaper ? "topic picker" : "guided SoulPath flow";
  const sampleOutput = isDailyPaper ? "sample newsletter" : "personalized guidance preview";
  const coreHashtags = isDailyPaper
    ? ["#DailyPaper", "#AINewsletter", "#NewsBriefing", "#Productivity", "#NewsWithoutTheScroll"]
    : ["#Astroya", "#Astrology", "#Palmistry", "#SelfDiscovery", "#SpiritualReflection"];
  const sceneSets: Record<10 | 15 | 30, GeneratedVideoScene[]> = {
    10: [
      {
        timecode: "0-3s",
        visual: `Fast cuts of noisy feeds switching to the ${productName} ${topicPicker}.`,
        voiceover: isDailyPaper ? "News should not eat your whole morning." : "Self-reflection should feel calm, not confusing.",
        onscreenText: isDailyPaper ? "Too much news?" : "Looking for clarity?"
      },
      {
        timecode: "3-7s",
        visual: isDailyPaper ? "Select AI, markets, sports, politics, and horoscopes." : "Select guidance categories, birth details, and a palmistry path.",
        voiceover: isDailyPaper ? "Choose what you care about." : "Share the path you want to explore.",
        onscreenText: isDailyPaper ? "Pick your topics" : "Choose your path"
      },
      {
        timecode: "7-10s",
        visual: `Show a clean ${sampleOutput}.`,
        voiceover: `Start with ${productName}.`,
        onscreenText: "Try it free"
      }
    ],
    15: [
      {
        timecode: "0-4s",
        visual: isDailyPaper ? "Phone screen opens several news apps, then pauses." : "Phone screen scrolls generic horoscope posts, then pauses.",
        voiceover: isDailyPaper ? "If your morning starts with five tabs and no clear answer, try this." : "If generic horoscope posts feel too shallow, try a more personal reflection flow.",
        onscreenText: isDailyPaper ? "Morning news, simplified" : "Personal reflection, simplified"
      },
      {
        timecode: "4-10s",
        visual: isDailyPaper ? "Daily Paper preferences: topics, region, daily or weekly." : "Astroya flow: categories, birth details, palm upload, guidance result.",
        voiceover: `${productName} lets you shape the experience around you.`,
        onscreenText: isDailyPaper ? "AI, finance, sports, culture" : "Astrology + palmistry"
      },
      {
        timecode: "10-15s",
        visual: `${sampleOutput} and signup page.`,
        voiceover: isDailyPaper ? "One source-linked briefing, built around you." : "Reflective guidance, built around your details.",
        onscreenText: "Start free"
      }
    ],
    30: [
      {
        timecode: "0-5s",
        visual: isDailyPaper ? "Split-screen: endless feed on one side, calm Daily Paper page on the other." : "Split-screen: generic horoscope feed on one side, calm Astroya flow on the other.",
        voiceover: isDailyPaper ? "Most news apps are built for scrolling. Daily Paper is built for finishing." : "Most astrology content is built for quick posts. Astroya is built for deeper reflection.",
        onscreenText: isDailyPaper ? "Stop scrolling. Start briefed." : "Less noise. More reflection."
      },
      {
        timecode: "5-12s",
        visual: isDailyPaper ? "User chooses detailed preferences across AI, technology, politics, finance, sports, horoscopes, and local news." : "User moves through guidance categories, birth details, and palm upload.",
        voiceover: isDailyPaper ? "Pick the topics you actually follow, from AI and markets to sports, culture, and local stories." : "Choose what you want to understand, then add the details that make the reading personal.",
        onscreenText: isDailyPaper ? "Choose your paper" : "Choose your SoulPath"
      },
      {
        timecode: "12-21s",
        visual: isDailyPaper ? "Newsletter preview shows short sections with source labels." : "Guidance preview shows a calm, structured reading.",
        voiceover: isDailyPaper ? "Daily Paper turns those preferences into a clean briefing with source-linked summaries." : "Astroya turns your path into a reflective reading you can explore further.",
        onscreenText: isDailyPaper ? "Source-linked summaries" : "Reflective guidance"
      },
      {
        timecode: "21-30s",
        visual: `${sampleOutput} transitions to signup.`,
        voiceover: isDailyPaper ? "Read a sample, then create your own. New users get a 15-day free trial." : "Start with a free guidance flow and see what resonates.",
        onscreenText: `Try ${productName} free`
      }
    ]
  };

  return {
    durationSeconds: duration,
    title: `${duration}s ${productName} short: ${isDailyPaper ? "news without the scroll" : "reflection without the noise"}`,
    hook: duration === 10
      ? (isDailyPaper ? "News should not eat your whole morning." : "Self-reflection should feel calm, not confusing.")
      : (isDailyPaper ? "Your morning news does not need to be a scroll session." : "Your astrology reading can be personal without feeling overwhelming."),
    scenes: sceneSets[duration],
    caption: isDailyPaper
      ? `Your news, chosen by you and summarized into one clean Daily Paper. Start with a sample: ${request.sampleRoute}`
      : `Explore astrology, palmistry, and reflective AI guidance with ${productName}. Start here: ${request.ctaRoute}`,
    hashtags: coreHashtags,
    targetRoute: request.ctaRoute
  };
}

function marketingJsonSchema(): Record<string, unknown> {
  const scene = {
    type: "object",
    additionalProperties: false,
    required: ["timecode", "visual", "voiceover", "onscreenText"],
    properties: {
      timecode: { type: "string" },
      visual: { type: "string" },
      voiceover: { type: "string" },
      onscreenText: { type: "string" }
    }
  };

  const video = {
    type: "object",
    additionalProperties: false,
    required: ["durationSeconds", "title", "hook", "scenes", "caption", "hashtags", "targetRoute"],
    properties: {
      durationSeconds: { type: "number", enum: VIDEO_DURATIONS },
      title: { type: "string" },
      hook: { type: "string" },
      scenes: { type: "array", items: scene },
      caption: { type: "string" },
      hashtags: { type: "array", items: { type: "string" } },
      targetRoute: { type: "string" }
    }
  };

  return {
    type: "object",
    additionalProperties: false,
    required: ["blogDraft", "videoScripts", "publishingPlan"],
    properties: {
      blogDraft: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "slug",
          "metaTitle",
          "metaDescription",
          "excerpt",
          "bodyMarkdown",
          "tags",
          "category",
          "targetKeyword",
          "canonicalPath",
          "ctaRoute",
          "sampleRoute"
        ],
        properties: {
          title: { type: "string" },
          slug: { type: "string" },
          metaTitle: { type: "string" },
          metaDescription: { type: "string" },
          excerpt: { type: "string" },
          bodyMarkdown: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          category: { type: "string" },
          targetKeyword: { type: "string" },
          canonicalPath: { type: "string" },
          ctaRoute: { type: "string" },
          sampleRoute: { type: "string" }
        }
      },
      videoScripts: { type: "array", items: video },
      publishingPlan: {
        type: "object",
        additionalProperties: false,
        required: ["recommendedPublishWindow", "reviewChecklist", "channels", "automationNotes"],
        properties: {
          recommendedPublishWindow: { type: "string" },
          reviewChecklist: { type: "array", items: { type: "string" } },
          channels: { type: "array", items: { type: "string" } },
          automationNotes: { type: "array", items: { type: "string" } }
        }
      }
    }
  };
}

function renderSourceBlock(sources: MarketingSourceSummary[]): string {
  if (!sources.length) {
    return [
      "## Current examples",
      "",
      "This draft is written as evergreen product education because no current source summaries were supplied. Add source summaries to turn this into a timely SEO article without asking the AI to invent current events."
    ].join("\n");
  }

  return [
    "## Current examples to include",
    "",
    ...sources.slice(0, 4).map((source) => `- **${source.title}** (${source.source}): ${source.summary}${source.url ? ` [Source](${source.url})` : ""}`)
  ].join("\n");
}

function normalizeSource(source: MarketingSourceSummary): MarketingSourceSummary {
  return {
    title: cleanText(source.title, ""),
    summary: cleanText(source.summary, ""),
    source: cleanText(source.source, ""),
    url: source.url ? cleanText(source.url, "") : undefined
  };
}

function cleanText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeRoute(value: unknown, fallback: string): string {
  const route = cleanText(value, fallback);
  if (route.startsWith("http://") || route.startsWith("https://")) {
    try {
      return new URL(route).pathname || fallback;
    } catch {
      return fallback;
    }
  }

  return route.startsWith("/") ? route : `/${route}`;
}

function routeUrl(baseUrl: string, route: string): string {
  return `${baseUrl.replace(/\/$/, "")}${normalizeRoute(route, route)}`;
}

function keywordFromTopic(topic: string): string {
  const cleaned = topic.toLowerCase().replace(/[^a-z0-9\s-]+/g, " ").replace(/\s+/g, " ").trim();
  if (cleaned.includes("astro") || cleaned.includes("palm") || cleaned.includes("soulpath")) return "personalized astrology guidance";
  if (cleaned.includes("daily news")) return "daily news briefing";
  if (cleaned.includes("newsletter")) return "personalized AI newsletter";
  return "daily news habit";
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => cleanText(value, "")).filter(Boolean))];
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "daily-paper";
}

function extractOutputText(response: OpenAIResponse): string {
  const text = response.output_text ?? response.output?.flatMap((item) => item.content ?? []).map((content) => content.text).filter(Boolean).join("");
  if (!text) throw new Error("OpenAI response did not include text output.");
  return text;
}

function buildSocialPosts(
  platform: MarketingPlatform,
  contentKit: MarketingAgentResult,
  sampleUrl: string,
  signupUrl: string,
  productName: string
): MakeMarketingCampaignResult["publishingQueue"]["socialPosts"] {
  const isDailyPaper = productName.toLowerCase().includes("daily paper");
  const hashtags = isDailyPaper ? ["#DailyPaper", "#AINewsletter", "#NewsBriefing"] : ["#Astroya", "#Astrology", "#Palmistry", "#SelfDiscovery"];

  if (platform === "blog") {
    return [
      {
        platform,
        format: "blog-link",
        copy: `${contentKit.blogDraft.excerpt} Explore ${productName}: ${sampleUrl}`,
        hashtags,
        targetUrl: sampleUrl,
        status: "draft"
      }
    ];
  }

  if (platform === "linkedin") {
    return [
      {
        platform,
        format: "blog-link",
        copy: `${contentKit.blogDraft.title}\n\n${contentKit.blogDraft.excerpt}\n\n${productName} helps people ${isDailyPaper ? "choose topics and receive a cleaner briefing" : "move through a calmer reflection experience"}. Start here: ${signupUrl}`,
        hashtags: isDailyPaper ? ["#AI", "#News", "#Productivity"] : ["#Astrology", "#Wellness", "#SelfDiscovery"],
        targetUrl: signupUrl,
        status: "draft"
      }
    ];
  }

  const script = contentKit.videoScripts.find((candidate) => candidate.durationSeconds === 15) ?? contentKit.videoScripts[0];
  return [
    {
      platform,
      format: "short-video-caption",
      copy: `${script.caption} ${signupUrl}`,
      hashtags: script.hashtags,
      targetUrl: signupUrl,
      status: "draft"
    }
  ];
}

function estimateMonthlyMakeOperations(platformCount: number, videoScriptCount: number): number {
  const dailyRuns = 30;
  const baseModulesPerRun = 4;
  const routerWorkPerRun = Math.max(1, platformCount);
  const videoBriefRowsPerRun = Math.max(1, videoScriptCount);
  return dailyRuns * (baseModulesPerRun + routerWorkPerRun + videoBriefRowsPerRun);
}

function isKnownPlatform(platform: MarketingPlatform): platform is MarketingPlatform {
  return DEFAULT_MARKETING_PLATFORMS.includes(platform) || platform === "linkedin";
}

function isVideoPlatform(platform: MarketingPlatform): platform is Exclude<MarketingPlatform, "blog" | "linkedin"> {
  return platform === "instagram-reels" || platform === "facebook-reels" || platform === "youtube-shorts";
}
