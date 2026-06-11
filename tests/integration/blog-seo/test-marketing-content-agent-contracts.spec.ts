import { describe, expect, it } from "vitest";
import { generateDailyMarketingContent, generateMakeMarketingCampaign } from "../../../apps/api/src/features/blog-seo/marketingContentAgent";

describe("marketing content agent contracts", () => {
  it("returns publishable draft assets with stable routes and review controls", async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const result = await generateDailyMarketingContent({
        date: "2026-06-02T08:00:00.000Z",
        topic: "daily newsletter for people who want useful news without doomscrolling",
        sampleRoute: "/samples/markets-daily-paper",
        ctaRoute: "/signup"
      });

      expect(result.date).toBe("2026-06-02");
      expect(result.blogDraft.sampleRoute).toBe("/samples/markets-daily-paper");
      expect(result.blogDraft.ctaRoute).toBe("/signup");
      expect(result.videoScripts).toHaveLength(3);
      expect(result.publishingPlan.channels).toContain("Blog");
      expect(result.publishingPlan.automationNotes.join(" ")).toContain("does not publish blog posts");
    } finally {
      process.env.OPENAI_API_KEY = originalKey;
    }
  });

  it("returns a Make.com-ready campaign contract without enabling autopublish", async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const result = await generateMakeMarketingCampaign({
        date: "2026-06-03T08:00:00.000Z",
        appId: "daily-paper",
        productName: "Daily Paper",
        topic: "one personalized daily newspaper for busy readers",
        platforms: ["blog", "instagram-reels", "youtube-shorts", "facebook-reels"],
        dailyVideoCount: 1
      });

      expect(result.app.appId).toBe("daily-paper");
      expect(result.strategy).toBe("minimal-cost");
      expect(result.makeScenario.trigger).toContain("Scheduler");
      expect(result.makeScenario.monthlyOperationEstimate).toBeLessThanOrEqual(1000);
      expect(result.makeScenario.setupChecklist.join(" ")).toContain("Astoria");
      expect(result.publishingQueue.socialPosts.every((post) => post.status === "draft")).toBe(true);
      expect(result.publishingQueue.videoBriefs.every((brief) => brief.estimatedExternalVideoCostUsd === 0)).toBe(true);
      expect(result.costGuardrails.join(" ")).toContain("cross-post");
    } finally {
      process.env.OPENAI_API_KEY = originalKey;
    }
  });

  it("supports Astroya as a separate app profile for the same Make.com framework", async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const result = await generateMakeMarketingCampaign({
        date: "2026-06-03T08:00:00.000Z",
        appId: "astroya",
        productName: "Astroya SoulPath",
        positioning: "A calm astrology and palmistry guidance experience for reflective self-discovery.",
        topic: "personal astrology and palmistry guidance for reflective self-discovery",
        audience: "spiritually curious adults",
        newsletterThemes: ["Vedic astrology", "Western astrology", "palmistry", "AI-powered consultation"],
        baseUrl: "https://www.astroya.ca",
        sampleRoute: "/how-it-works",
        ctaRoute: "/signup",
        platforms: ["blog", "instagram-reels", "youtube-shorts", "facebook-reels"],
        dailyVideoCount: 1
      });

      expect(result.app.appId).toBe("astroya");
      expect(result.app.baseUrl).toBe("https://www.astroya.ca");
      expect(result.contentKit.blogDraft.title).toContain("Astroya");
      expect(result.contentKit.blogDraft.tags).toContain("astrology");
      expect(result.publishingQueue.blogDraft.destination).toContain("Astroya");
      expect(result.publishingQueue.videoBriefs.every((brief) => brief.productionMode === "script-only")).toBe(true);
      expect(result.requiredUserInputs.join(" ")).toContain("Astroya SoulPath social account access");
    } finally {
      process.env.OPENAI_API_KEY = originalKey;
    }
  });
});
