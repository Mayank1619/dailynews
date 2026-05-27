import { describe, expect, it } from "vitest";
import { ReadSummariesThatAreHonestAboutTheirAiOriginService } from "../../../apps/api/src/features/ai-curation/read-summaries-that-are-honest-about-their-ai-origin.service";

describe("US2 integration: AI-origin honesty contract", () => {
  it("ensures AI-generated summaries carry a Summary label and attribution", () => {
    const service = new ReadSummariesThatAreHonestAboutTheirAiOriginService();

    const result = service.annotate({
      items: [
        {
          id: "sum-a1",
          processedArticleId: "a1",
          title: "Article 1",
          summaryText: "Concise machine summary",
          bulletPoints: [],
          fallbackApplied: false,
          source: { sourceName: "Wire", canonicalUrl: "https://news.example.com/article-1" },
          modelInfo: { modelName: "model-a", modelVersion: "1", invokedAt: "2026-05-27T00:00:00.000Z" },
          rankedScore: 1,
          categories: ["tech"],
          summaryLabel: "Summary",
          publishedAt: "2026-05-27T00:00:00.000Z"
        }
      ]
    });

    expect(result.items[0].summaryLabel).toBe("Summary");
    expect(result.items[0].attributionUrl).toBe("https://news.example.com/article-1");
  });
});
