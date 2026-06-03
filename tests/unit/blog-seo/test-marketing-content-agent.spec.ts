import { describe, expect, it } from "vitest";
import {
  buildCompactMarketingPrompt,
  buildFallbackMarketingContent,
  generateDailyMarketingContent,
  type MarketingAgentRequest
} from "../../../apps/api/src/features/blog-seo/marketingContentAgent";

const request: MarketingAgentRequest = {
  date: new Date("2026-06-02T08:00:00.000Z"),
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
});
