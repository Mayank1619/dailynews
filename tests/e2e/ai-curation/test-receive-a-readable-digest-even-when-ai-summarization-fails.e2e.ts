import { expect, test } from "@playwright/test";
import { ReceiveARankedSummarizedDigestOfRelevantStoriesService } from "../../../apps/api/src/features/ai-curation/receive-a-ranked-summarized-digest-of-relevant-stories.service";
import type { CurationSummarizer } from "../../../apps/api/src/features/ai-curation/receive-a-ranked-summarized-digest-of-relevant-stories.types";

test("US3 e2e: digest remains readable when AI summarization fails", async () => {
  const flakySummarizer: CurationSummarizer = {
    summarize: async (article) => {
      if (article.id === "fail-me") {
        throw new Error("timeout");
      }

      return {
        summaryText: `${article.title}: ${article.snippet}`,
        bulletPoints: [],
        modelInfo: {
          modelName: "mock-model",
          modelVersion: "1",
          invokedAt: "2026-05-27T00:00:00.000Z"
        }
      };
    }
  };

  const service = new ReceiveARankedSummarizedDigestOfRelevantStoriesService(flakySummarizer);

  const result = await service.curate({
    preference: { userId: "e2e-us3", topics: ["tech"] },
    articles: [
      {
        id: "ok-1",
        dedupGroupId: "dg-ok-1",
        title: "Healthy summary",
        snippet: "Should be AI-generated.",
        canonicalUrl: "https://news.example.com/ok",
        sourceName: "Tech",
        publishedAt: "2026-05-27T12:00:00.000Z",
        categories: ["tech"]
      },
      {
        id: "fail-me",
        dedupGroupId: "dg-fail-1",
        title: "Failed summary",
        snippet: "Should still be readable.",
        canonicalUrl: "https://news.example.com/fail",
        sourceName: "Tech",
        publishedAt: "2026-05-27T11:00:00.000Z",
        categories: ["tech"]
      }
    ]
  });

  expect(result.items).toHaveLength(2);
  const fallback = result.items.find((item) => item.processedArticleId === "fail-me");
  expect(fallback?.fallbackApplied).toBe(true);
  expect(fallback?.summaryText).toContain("Failed summary");
});
