import { describe, expect, it } from "vitest";
import { ReceiveARankedSummarizedDigestOfRelevantStoriesService } from "../../../apps/api/src/features/ai-curation/receive-a-ranked-summarized-digest-of-relevant-stories.service";

describe("US4 integration: controlled stories per category contract", () => {
  it("enforces per-category limits during digest assembly", async () => {
    const service = new ReceiveARankedSummarizedDigestOfRelevantStoriesService();

    const result = await service.curate({
      preference: { userId: "u-limit", topics: ["tech", "markets"] },
      perCategoryLimit: 1,
      articles: [
        {
          id: "tech-1",
          dedupGroupId: "dg-tech-1",
          title: "Tech headline 1",
          snippet: "One",
          canonicalUrl: "https://news.example.com/tech/1",
          sourceName: "Tech",
          publishedAt: "2026-05-27T12:00:00.000Z",
          categories: ["tech"]
        },
        {
          id: "tech-2",
          dedupGroupId: "dg-tech-2",
          title: "Tech headline 2",
          snippet: "Two",
          canonicalUrl: "https://news.example.com/tech/2",
          sourceName: "Tech",
          publishedAt: "2026-05-27T11:00:00.000Z",
          categories: ["tech"]
        },
        {
          id: "markets-1",
          dedupGroupId: "dg-markets-1",
          title: "Markets headline",
          snippet: "Three",
          canonicalUrl: "https://news.example.com/markets/1",
          sourceName: "Markets",
          publishedAt: "2026-05-27T10:00:00.000Z",
          categories: ["markets"]
        }
      ]
    });

    const byCategory = result.items.reduce<Record<string, number>>((acc, item) => {
      const key = item.categories[0] ?? "uncategorized";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    expect(byCategory.tech).toBe(1);
    expect(byCategory.markets).toBe(1);
  });
});
