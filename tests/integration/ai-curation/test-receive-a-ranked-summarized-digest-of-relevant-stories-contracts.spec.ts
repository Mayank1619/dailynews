import { describe, expect, it } from "vitest";
import { ReceiveARankedSummarizedDigestOfRelevantStoriesService } from "../../../apps/api/src/features/ai-curation/receive-a-ranked-summarized-digest-of-relevant-stories.service";

describe("US1 integration: ranked summarized digest contract", () => {
  it("returns ranked records with summary and model metadata", async () => {
    const service = new ReceiveARankedSummarizedDigestOfRelevantStoriesService();

    const result = await service.curate({
      preference: { userId: "u1", topics: ["tech", "markets"] },
      articles: [
        {
          id: "a1",
          dedupGroupId: "g1",
          title: "AI budgets rise in enterprise",
          snippet: "Boards increased spending on automation initiatives.",
          canonicalUrl: "https://news.example.com/tech/ai-budgets",
          sourceName: "Wire",
          publishedAt: "2026-05-27T10:00:00.000Z",
          categories: ["tech"]
        }
      ]
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].processedArticleId).toBe("a1");
    expect(result.items[0].summaryText).toBeTruthy();
    expect(result.items[0].source.canonicalUrl).toBe("https://news.example.com/tech/ai-budgets");
    expect(result.items[0].modelInfo.modelName).toBeTruthy();
  });
});
