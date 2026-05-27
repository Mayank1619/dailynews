import { expect, test } from "@playwright/test";
import { ReceiveARankedSummarizedDigestOfRelevantStoriesService } from "../../../apps/api/src/features/ai-curation/receive-a-ranked-summarized-digest-of-relevant-stories.service";

test("US1 e2e: ranked digest generation returns readable summaries", async () => {
  const service = new ReceiveARankedSummarizedDigestOfRelevantStoriesService();

  const result = await service.curate({
    preference: { userId: "u-e2e-1", topics: ["markets"] },
    articles: [
      {
        id: "e2e-article-1",
        dedupGroupId: "e2e-dg-1",
        title: "Markets rally after inflation cools",
        snippet: "Investors lifted indexes after economic data softened.",
        canonicalUrl: "https://news.example.com/markets/rally",
        sourceName: "Daily Markets",
        publishedAt: "2026-05-27T13:00:00.000Z",
        categories: ["markets"]
      }
    ]
  });

  expect(result.items).toHaveLength(1);
  expect(result.items[0].summaryText?.length ?? 0).toBeGreaterThan(0);
});
