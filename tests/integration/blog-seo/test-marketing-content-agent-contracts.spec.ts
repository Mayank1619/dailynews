import { describe, expect, it } from "vitest";
import { generateDailyMarketingContent } from "../../../apps/api/src/features/blog-seo/marketingContentAgent";

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
});
