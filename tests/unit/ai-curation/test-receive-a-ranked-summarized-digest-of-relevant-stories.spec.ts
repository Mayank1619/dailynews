import { describe, expect, it } from "vitest";
import { ReceiveARankedSummarizedDigestOfRelevantStoriesService } from "../../../apps/api/src/features/ai-curation/receive-a-ranked-summarized-digest-of-relevant-stories.service";

describe("US1 unit: receive a ranked summarized digest", () => {
  it("prioritizes articles that match user topics", async () => {
    const service = new ReceiveARankedSummarizedDigestOfRelevantStoriesService();

    const result = await service.curate({
      preference: { userId: "u-topics", topics: ["tech"] },
      articles: [
        {
          id: "unmatched",
          dedupGroupId: "dg-1",
          title: "Travel tips for long weekends",
          snippet: "A guide for train and flight deals.",
          canonicalUrl: "https://news.example.com/lifestyle/travel",
          sourceName: "City Mag",
          publishedAt: "2026-05-27T11:00:00.000Z",
          categories: ["lifestyle"]
        },
        {
          id: "matched",
          dedupGroupId: "dg-2",
          title: "Chipmaker unveils new AI accelerator",
          snippet: "The product targets data-center inference workloads.",
          canonicalUrl: "https://news.example.com/tech/chipmaker",
          sourceName: "Tech Desk",
          publishedAt: "2026-05-27T10:00:00.000Z",
          categories: ["tech"]
        }
      ]
    });

    expect(result.items[0].processedArticleId).toBe("matched");
  });

  it("falls back to recency ranking when preferences are empty", async () => {
    const service = new ReceiveARankedSummarizedDigestOfRelevantStoriesService();

    const result = await service.curate({
      preference: { userId: "u-empty", topics: [] },
      articles: [
        {
          id: "older",
          dedupGroupId: "dg-3",
          title: "Earlier market update",
          snippet: "Morning briefing.",
          canonicalUrl: "https://news.example.com/markets/older",
          sourceName: "Markets",
          publishedAt: "2026-05-27T08:00:00.000Z",
          categories: ["markets"]
        },
        {
          id: "newer",
          dedupGroupId: "dg-4",
          title: "Late market update",
          snippet: "Afternoon briefing.",
          canonicalUrl: "https://news.example.com/markets/newer",
          sourceName: "Markets",
          publishedAt: "2026-05-27T12:00:00.000Z",
          categories: ["markets"]
        }
      ]
    });

    expect(result.items[0].processedArticleId).toBe("newer");
  });
});
