import { describe, expect, it } from "vitest";
import {
  buildCompactMarketingPrompt,
  buildFallbackMarketingContent,
  buildMakeMarketingCampaign,
  generateDailyMarketingContent,
  generateMarketingAutomationRun,
  type MarketingAgentRequest
} from "../../../apps/api/src/features/blog-seo/marketingContentAgent";

const request: MarketingAgentRequest = {
  date: new Date("2026-06-02T08:00:00.000Z"),
  productName: "Daily Paper",
  positioning: "A personalized AI daily paper for readers who want useful news without the scroll.",
  topic: "why personalized daily news helps young professionals make better everyday decisions",
  audience: "young professionals who want useful news without scrolling",
  newsletterThemes: ["source-linked AI summaries", "topic preferences", "15-day free trial"],
  sourceSummaries: [
    {
      title: "AI summaries are tested with editorial source links",
      summary: "Publishers are experimenting with AI-assisted summaries that preserve links back to original reporting.",
      source: "Example Media Lab",
      url: "https://example.com/ai-summaries"
    }
  ],
  baseUrl: "https://dailynews-theta-ten.vercel.app",
  sampleRoute: "/samples/ai-daily-paper",
  ctaRoute: "/signup"
};

describe("marketing content agent", () => {
  it("builds a compact prompt for daily SEO and video generation", () => {
    const prompt = buildCompactMarketingPrompt({
      ...request,
      date: new Date(request.date as Date),
      productName: request.productName ?? "",
      positioning: request.positioning ?? "",
      topic: request.topic ?? "",
      audience: request.audience ?? "",
      newsletterThemes: request.newsletterThemes ?? [],
      sourceSummaries: request.sourceSummaries ?? [],
      baseUrl: request.baseUrl ?? "",
      sampleRoute: request.sampleRoute ?? "",
      ctaRoute: request.ctaRoute ?? ""
    });

    expect(prompt.length).toBeLessThan(1600);
    expect(prompt).toContain("Daily Paper");
    expect(prompt).toContain("videoDurationsSeconds");
    expect(prompt).toContain("Example Media Lab");
  });

  it("creates a deterministic blog draft and 10, 15, and 30 second video scripts", () => {
    const result = buildFallbackMarketingContent({
      ...request,
      date: new Date(request.date as Date),
      productName: request.productName ?? "",
      positioning: request.positioning ?? "",
      topic: request.topic ?? "",
      audience: request.audience ?? "",
      newsletterThemes: request.newsletterThemes ?? [],
      sourceSummaries: request.sourceSummaries ?? [],
      baseUrl: request.baseUrl ?? "",
      sampleRoute: request.sampleRoute ?? "",
      ctaRoute: request.ctaRoute ?? ""
    });

    expect(result.blogDraft.title.length).toBeLessThanOrEqual(60);
    expect(result.blogDraft.metaDescription.length).toBeLessThanOrEqual(155);
    expect(result.blogDraft.bodyMarkdown).toContain("/signup");
    expect(result.blogDraft.bodyMarkdown).toContain("/samples/ai-daily-paper");
    expect(result.videoScripts.map((script) => script.durationSeconds)).toEqual([10, 15, 30]);
    expect(result.videoScripts.every((script) => script.scenes.length >= 3)).toBe(true);
    expect(result.publishingPlan.reviewChecklist).toContain("Verify links to the signup page and sample newsletter page.");
  });

  it("generates safely without requiring an OpenAI key", async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const result = await generateDailyMarketingContent(request);

      expect(result.generation.mode).toBe("deterministic-fallback");
      expect(result.blogDraft.canonicalPath).toMatch(/^\/blog\//);
      expect(result.videoScripts[2].caption).toContain("Daily Paper");
    } finally {
      process.env.OPENAI_API_KEY = originalKey;
    }
  });

  it("builds a free-tier-friendly Make.com campaign kit for Daily Paper", () => {
    const contentKit = buildFallbackMarketingContent({
      ...request,
      date: new Date(request.date as Date),
      productName: request.productName ?? "",
      positioning: request.positioning ?? "",
      topic: request.topic ?? "",
      audience: request.audience ?? "",
      newsletterThemes: request.newsletterThemes ?? [],
      sourceSummaries: request.sourceSummaries ?? [],
      baseUrl: request.baseUrl ?? "",
      sampleRoute: request.sampleRoute ?? "",
      ctaRoute: request.ctaRoute ?? ""
    });

    const campaign = buildMakeMarketingCampaign(
      {
        ...request,
        date: new Date(request.date as Date),
        productName: request.productName ?? "",
        positioning: request.positioning ?? "",
        topic: request.topic ?? "",
        audience: request.audience ?? "",
        newsletterThemes: request.newsletterThemes ?? [],
        sourceSummaries: request.sourceSummaries ?? [],
        baseUrl: request.baseUrl ?? "",
        sampleRoute: request.sampleRoute ?? "",
        ctaRoute: request.ctaRoute ?? "",
        appId: "daily-paper",
        strategy: "minimal-cost",
        platforms: ["blog", "instagram-reels", "youtube-shorts", "facebook-reels"],
        dailyVideoCount: 1
      },
      contentKit
    );

    expect(campaign.makeScenario.minimumPlanFit).toBe("free-tier-friendly");
    expect(campaign.makeScenario.monthlyOperationEstimate).toBeLessThanOrEqual(1000);
    expect(campaign.publishingQueue.blogDraft.status).toBe("draft");
    expect(campaign.publishingQueue.videoBriefs.every((brief) => brief.productionMode === "script-only")).toBe(true);
    expect(campaign.costGuardrails.join(" ")).toContain("video briefs");
    expect(campaign.requiredUserInputs.join(" ")).toContain("Make.com");
  });

  it("builds a separate Astroya campaign without Daily Paper wording", () => {
    const astroyaRequest: MarketingAgentRequest = {
      date: new Date("2026-06-03T08:00:00.000Z"),
      productName: "Astroya SoulPath",
      positioning: "A calm astrology and palmistry guidance experience for reflective self-discovery.",
      topic: "why personalized astrology and palmistry guidance helps people reflect with more clarity",
      audience: "spiritually curious adults who want a calm personal guidance flow",
      newsletterThemes: ["Vedic and Western astrology", "palmistry-assisted reflection", "birth details", "AI-powered consultation"],
      sourceSummaries: [],
      baseUrl: "https://www.astroya.ca",
      sampleRoute: "/how-it-works",
      ctaRoute: "/signup"
    };
    const contentKit = buildFallbackMarketingContent({
      ...astroyaRequest,
      date: new Date(astroyaRequest.date as Date),
      productName: astroyaRequest.productName ?? "",
      positioning: astroyaRequest.positioning ?? "",
      topic: astroyaRequest.topic ?? "",
      audience: astroyaRequest.audience ?? "",
      newsletterThemes: astroyaRequest.newsletterThemes ?? [],
      sourceSummaries: astroyaRequest.sourceSummaries ?? [],
      baseUrl: astroyaRequest.baseUrl ?? "",
      sampleRoute: astroyaRequest.sampleRoute ?? "",
      ctaRoute: astroyaRequest.ctaRoute ?? ""
    });
    const campaign = buildMakeMarketingCampaign(
      {
        ...astroyaRequest,
        date: new Date(astroyaRequest.date as Date),
        productName: astroyaRequest.productName ?? "",
        positioning: astroyaRequest.positioning ?? "",
        topic: astroyaRequest.topic ?? "",
        audience: astroyaRequest.audience ?? "",
        newsletterThemes: astroyaRequest.newsletterThemes ?? [],
        sourceSummaries: astroyaRequest.sourceSummaries ?? [],
        baseUrl: astroyaRequest.baseUrl ?? "",
        sampleRoute: astroyaRequest.sampleRoute ?? "",
        ctaRoute: astroyaRequest.ctaRoute ?? "",
        appId: "astroya",
        strategy: "minimal-cost",
        platforms: ["blog", "instagram-reels", "youtube-shorts", "facebook-reels"],
        dailyVideoCount: 1
      },
      contentKit
    );

    expect(campaign.app.productName).toBe("Astroya SoulPath");
    expect(campaign.publishingQueue.blogDraft.targetUrl).toContain("https://www.astroya.ca");
    expect(campaign.publishingQueue.socialPosts[0].copy).toContain("Astroya SoulPath");
    expect(campaign.publishingQueue.socialPosts.flatMap((post) => post.hashtags)).toContain("#Astroya");
    expect(campaign.contentKit.blogDraft.bodyMarkdown).toContain("self-discovery");
    expect(campaign.contentKit.blogDraft.bodyMarkdown).not.toContain("Daily Paper is built around");
  });

  it("creates a provider-neutral owned-site auto-publish run for both apps", async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const run = await generateMarketingAutomationRun({
        date: new Date("2026-06-03T10:00:00.000Z"),
        provider: "vercel-cron",
        mode: "auto-publish-owned-sites",
        appIds: ["daily-paper", "astroya"]
      });

      expect(run.runId).toBe("marketing-2026-06-03-daily-paper-astroya");
      expect(run.scheduler.recommendedPrimary).toBe("vercel-cron");
      expect(run.monthlyCostEstimateUsd.scheduler).toBe(0);
      expect(run.status).toBe("published-to-owned-sites");
      expect(run.apps.map((app) => app.appId)).toEqual(["daily-paper", "astroya"]);
      expect(run.apps.every((app) => app.publishing.publishPolicy === "auto-publish-owned-sites")).toBe(true);
      expect(run.apps[0].publishing.destination).toBe("Daily Paper public blog");
      expect(run.safeguards.join(" ")).toContain("Owned-site blog content can be published automatically");
      expect(run.apps[1].campaign.contentKit.blogDraft.bodyMarkdown).toContain("self-discovery");
    } finally {
      process.env.OPENAI_API_KEY = originalKey;
    }
  });
});
