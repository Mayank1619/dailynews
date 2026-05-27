import { describe, expect, it } from "vitest";
import { ReadSummariesThatAreHonestAboutTheirAiOriginService } from "../../../apps/api/src/features/ai-curation/read-summaries-that-are-honest-about-their-ai-origin.service";

describe("US2 unit: summary labels are honest about AI origin", () => {
  it("keeps label for AI generated content", () => {
    const service = new ReadSummariesThatAreHonestAboutTheirAiOriginService();

    const result = service.annotate({
      items: [
        {
          id: "sum-1",
          processedArticleId: "a1",
          title: "AI summary",
          summaryText: "Generated summary",
          bulletPoints: [],
          fallbackApplied: false,
          source: { sourceName: "Wire", canonicalUrl: "https://news.example.com/a1" },
          modelInfo: { modelName: "m", modelVersion: "v", invokedAt: "2026-05-27T00:00:00.000Z" },
          rankedScore: 10,
          categories: ["tech"],
          summaryLabel: "Summary",
          publishedAt: "2026-05-27T10:00:00.000Z"
        }
      ]
    });

    expect(result.items[0].summaryLabel).toBe("Summary");
  });

  it("removes label when fallback content is shown", () => {
    const service = new ReadSummariesThatAreHonestAboutTheirAiOriginService();

    const result = service.annotate({
      items: [
        {
          id: "sum-2",
          processedArticleId: "a2",
          title: "Fallback summary",
          summaryText: "Title - snippet",
          bulletPoints: [],
          fallbackApplied: true,
          source: { sourceName: "Wire", canonicalUrl: "https://news.example.com/a2" },
          modelInfo: { modelName: null, modelVersion: null, invokedAt: null },
          rankedScore: 5,
          categories: ["markets"],
          summaryLabel: null,
          publishedAt: "2026-05-27T10:00:00.000Z"
        }
      ]
    });

    expect(result.items[0].summaryLabel).toBeNull();
  });
});
