import { expect, test } from "@playwright/test";
import { ReadSummariesThatAreHonestAboutTheirAiOriginService } from "../../../apps/api/src/features/ai-curation/read-summaries-that-are-honest-about-their-ai-origin.service";

test("US2 e2e: rendered digest metadata keeps attribution and labels", async () => {
  const service = new ReadSummariesThatAreHonestAboutTheirAiOriginService();

  const result = service.annotate({
    items: [
      {
        id: "sum-e2e",
        processedArticleId: "p-e2e",
        title: "Digest item",
        summaryText: "Machine summary",
        bulletPoints: [],
        fallbackApplied: false,
        source: { sourceName: "Daily Source", canonicalUrl: "https://news.example.com/e2e" },
        modelInfo: { modelName: "model", modelVersion: "1", invokedAt: "2026-05-27T00:00:00.000Z" },
        rankedScore: 1,
        categories: ["tech"],
        summaryLabel: "Summary",
        publishedAt: "2026-05-27T10:00:00.000Z"
      }
    ]
  });

  expect(result.items[0].summaryLabel).toBe("Summary");
  expect(result.items[0].attributionUrl).toContain("https://news.example.com/e2e");
});
