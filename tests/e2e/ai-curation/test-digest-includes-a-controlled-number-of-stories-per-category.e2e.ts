import { expect, test } from "@playwright/test";
import { ReceiveARankedSummarizedDigestOfRelevantStoriesService } from "../../../apps/api/src/features/ai-curation/receive-a-ranked-summarized-digest-of-relevant-stories.service";

test("US4 e2e: digest enforces category quotas", async () => {
  const service = new ReceiveARankedSummarizedDigestOfRelevantStoriesService();

  const result = await service.curate({
    preference: { userId: "u-e2e-limit", topics: ["tech", "markets"] },
    perCategoryLimit: 1,
    articles: [
      {
        id: "t1",
        dedupGroupId: "dg-t1",
        title: "Tech story 1",
        snippet: "1",
        canonicalUrl: "https://news.example.com/t1",
        sourceName: "Source",
        publishedAt: "2026-05-27T10:00:00.000Z",
        categories: ["tech"]
      },
      {
        id: "t2",
        dedupGroupId: "dg-t2",
        title: "Tech story 2",
        snippet: "2",
        canonicalUrl: "https://news.example.com/t2",
        sourceName: "Source",
        publishedAt: "2026-05-27T09:00:00.000Z",
        categories: ["tech"]
      },
      {
        id: "m1",
        dedupGroupId: "dg-m1",
        title: "Markets story 1",
        snippet: "3",
        canonicalUrl: "https://news.example.com/m1",
        sourceName: "Source",
        publishedAt: "2026-05-27T08:00:00.000Z",
        categories: ["markets"]
      }
    ]
  });

  const techItems = result.items.filter((item) => item.categories[0] === "tech");
  expect(techItems).toHaveLength(1);
});
