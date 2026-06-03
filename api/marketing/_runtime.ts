export type MarketingSourceSummary = {
  title: string;
  summary: string;
  source: string;
  url?: string;
};

export type MarketingAgentRequest = {
  date?: Date | string;
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

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{ content?: Array<{ text?: string }> }>;
};

type AiMarketingPayload = {
  blogDraft?: GeneratedBlogDraft;
  videoScripts?: GeneratedVideoScript[];
  publishingPlan?: MarketingAgentResult["publishingPlan"];
};

const DEFAULT_TOPIC = "why reading a short daily news briefing helps people make better everyday decisions";
const DEFAULT_AUDIENCE = "busy young professionals and students who want useful news without doomscrolling";
const DEFAULT_THEMES = ["personalized AI morning paper", "source-linked summaries", "15-day free trial", "daily or weekly delivery"];
const DEFAULT_BASE_URL = "https://dailynews-theta-ten.vercel.app";
const DEFAULT_SAMPLE_ROUTE = "/samples/ai-daily-paper";
const DEFAULT_CTA_ROUTE = "/signup";
const VIDEO_DURATIONS = [10, 15, 30] as const;

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
          "Create one SEO blog draft and three short-form video scripts for Daily Paper.",
          "Use source summaries only for factual current claims. If sources are absent, write evergreen product education.",
          "Avoid hype, fake testimonials, invented metrics, and unsupported financial, political, legal, or medical certainty.",
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

export function buildCompactMarketingPrompt(request: Required<MarketingAgentRequest> & { date: Date }): string {
  return JSON.stringify({
    date: request.date.toISOString().slice(0, 10),
    product: "Daily Paper",
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
  const title = "How a Daily News Habit Helps You Make Better Decisions";
  const slugValue = `${slug(keyword)}-${date}`;
  const sampleUrl = routeUrl(request.baseUrl, request.sampleRoute);
  const signupUrl = routeUrl(request.baseUrl, request.ctaRoute);
  const sourceBlock = renderSourceBlock(request.sourceSummaries);
  const themeSentence = request.newsletterThemes.slice(0, 4).join(", ");

  return {
    date,
    topic: request.topic,
    audience: request.audience,
    blogDraft: {
      title,
      slug: slugValue,
      metaTitle: title,
      metaDescription: "See how a short, personalized Daily Paper briefing can turn news overload into clearer everyday decisions.",
      excerpt: "A short daily briefing can help readers stay informed without losing the morning to endless feeds.",
      bodyMarkdown: [
        `# ${title}`,
        "",
        "Most people do not need more noise in the morning. They need a smaller, clearer briefing that helps them understand what changed, what matters, and what they can ignore for now.",
        "",
        "Daily Paper is built around that idea. Readers choose the topics they care about, such as AI, technology, politics, markets, sports, culture, horoscopes, and local news. The product then turns those preferences into a concise paper-style briefing with source-linked summaries.",
        "",
        "## Why a shorter briefing works",
        "",
        "A focused briefing gives readers a repeatable habit: scan the top changes, understand the context, and move on with the day. That matters for students, founders, professionals, and anyone who wants to sound informed without living inside a feed.",
        "",
        "## What Daily Paper makes easier",
        "",
        `The first version of the experience focuses on ${themeSentence}. That combination is important because useful news is not just about more headlines. It is about relevance, timing, and clarity.`,
        "",
        sourceBlock,
        "",
        "## A better morning loop",
        "",
        "Instead of opening several apps, a reader can start with one personalized paper, follow the source links when something matters, and skip the rest. Over time, that creates a calmer relationship with news and a more useful way to keep up.",
        "",
        "## Try a sample",
        "",
        `Start with a public sample at [Daily Paper samples](${sampleUrl}), then create your own version from your preferences. New users can start at [signup](${signupUrl}).`
      ].join("\n"),
      tags: ["daily news", "AI newsletter", "personalized news", "productivity", "news habits"],
      category: "Productivity and news habits",
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
        "Review captions for exaggerated claims or fake testimonials before posting."
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
    topic: cleanText(request.topic, DEFAULT_TOPIC),
    audience: cleanText(request.audience, DEFAULT_AUDIENCE),
    newsletterThemes: request.newsletterThemes?.length ? request.newsletterThemes.map((theme) => cleanText(theme, "")).filter(Boolean) : DEFAULT_THEMES,
    sourceSummaries: request.sourceSummaries?.length ? request.sourceSummaries.map(normalizeSource).filter((source) => source.title && source.summary && source.source) : [],
    baseUrl: cleanText(request.baseUrl, DEFAULT_BASE_URL).replace(/\/$/, ""),
    sampleRoute: normalizeRoute(request.sampleRoute, DEFAULT_SAMPLE_ROUTE),
    ctaRoute: normalizeRoute(request.ctaRoute, DEFAULT_CTA_ROUTE)
  };
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
    title: cleanText(script.title, `Daily Paper ${script.durationSeconds}s short`).slice(0, 80),
    hook: cleanText(script.hook, "Your morning news does not need to be a scroll session.").slice(0, 160),
    scenes: script.scenes.slice(0, 6).map((scene) => ({
      timecode: cleanText(scene.timecode, "0:00"),
      visual: cleanText(scene.visual, "Show Daily Paper interface and sample newsletter."),
      voiceover: cleanText(scene.voiceover, "Choose your topics and get a clean briefing."),
      onscreenText: cleanText(scene.onscreenText, "Your news, simplified.")
    })),
    caption: cleanText(script.caption, "Try a cleaner way to read the news with Daily Paper.").slice(0, 280),
    hashtags: uniqueStrings(script.hashtags).slice(0, 10),
    targetRoute: normalizeRoute(script.targetRoute, defaultRoute)
  };
}

function buildFallbackVideo(duration: 10 | 15 | 30, request: Required<MarketingAgentRequest> & { date: Date }): GeneratedVideoScript {
  const sceneSets: Record<10 | 15 | 30, GeneratedVideoScene[]> = {
    10: [
      {
        timecode: "0-3s",
        visual: "Fast cuts of crowded news feeds switching to the Daily Paper topic picker.",
        voiceover: "News should not eat your whole morning.",
        onscreenText: "Too much news?"
      },
      {
        timecode: "3-7s",
        visual: "Select AI, markets, sports, politics, and horoscopes.",
        voiceover: "Choose what you care about.",
        onscreenText: "Pick your topics"
      },
      {
        timecode: "7-10s",
        visual: "Show a clean sample newsletter with source labels.",
        voiceover: "Get one clean Daily Paper.",
        onscreenText: "Try it free"
      }
    ],
    15: [
      {
        timecode: "0-4s",
        visual: "Phone screen opens several news apps, then pauses.",
        voiceover: "If your morning starts with five tabs and no clear answer, try this.",
        onscreenText: "Morning news, simplified"
      },
      {
        timecode: "4-10s",
        visual: "Daily Paper preferences: topics, region, daily or weekly.",
        voiceover: "Daily Paper lets you choose the topics and delivery rhythm.",
        onscreenText: "AI, finance, sports, culture"
      },
      {
        timecode: "10-15s",
        visual: "Inbox preview and public sample page.",
        voiceover: "One source-linked briefing, built around you.",
        onscreenText: "Start with a sample"
      }
    ],
    30: [
      {
        timecode: "0-5s",
        visual: "Split-screen: endless feed on one side, calm Daily Paper page on the other.",
        voiceover: "Most news apps are built for scrolling. Daily Paper is built for finishing.",
        onscreenText: "Stop scrolling. Start briefed."
      },
      {
        timecode: "5-12s",
        visual: "User chooses detailed preferences across AI, technology, politics, finance, sports, horoscopes, and local news.",
        voiceover: "Pick the topics you actually follow, from AI and markets to sports, culture, and local stories.",
        onscreenText: "Choose your paper"
      },
      {
        timecode: "12-21s",
        visual: "Newsletter preview shows short sections with source labels.",
        voiceover: "Daily Paper turns those preferences into a clean briefing with source-linked summaries.",
        onscreenText: "Source-linked summaries"
      },
      {
        timecode: "21-30s",
        visual: "Sample newsletter page transitions to signup.",
        voiceover: "Read a sample, then create your own. New users get a 15-day free trial.",
        onscreenText: "Try Daily Paper free"
      }
    ]
  };

  return {
    durationSeconds: duration,
    title: `${duration}s Daily Paper short: news without the scroll`,
    hook: duration === 10 ? "News should not eat your whole morning." : "Your morning news does not need to be a scroll session.",
    scenes: sceneSets[duration],
    caption: `Your news, chosen by you and summarized into one clean Daily Paper. Start with a sample: ${request.sampleRoute}`,
    hashtags: ["#DailyPaper", "#AINewsletter", "#NewsBriefing", "#Productivity", "#NewsWithoutTheScroll"],
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
