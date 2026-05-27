import { describe, expect, it } from "vitest";
import { ReceiveARankedSummarizedDigestOfRelevantStoriesService } from "../../../apps/api/src/features/ai-curation/receive-a-ranked-summarized-digest-of-relevant-stories.service";

describe("US4 unit: controlled number of stories per category", () => {
  it("rejects invalid per-category limits", async () => {
    const service = new ReceiveARankedSummarizedDigestOfRelevantStoriesService();

    await expect(
      service.curate({
        preference: { userId: "u-invalid", topics: ["tech"] },
        perCategoryLimit: 0,
        articles: []
      })
    ).rejects.toThrow("perCategoryLimit must be greater than zero");
  });

  it("keeps only the top-N stories per category", async () => {
    const service = new ReceiveARankedSummarizedDigestOfRelevantStoriesService();

    const result = await service.curate({
      preference: { userId: "u-n", topics: ["tech"] },
      perCategoryLimit: 2,
      articles: [
        {
          id: "tech-a",
          dedupGroupId: "dg-a",
          title: "Tech A",
          snippet: "A",
          canonicalUrl: "https://news.example.com/tech/a",
          sourceName: "Tech",
          publishedAt: "2026-05-27T12:00:00.000Z",
          categories: ["tech"]
        },
        {
          id: "tech-b",
          dedupGroupId: "dg-b",
          title: "Tech B",
          snippet: "B",
          canonicalUrl: "https://news.example.com/tech/b",
          sourceName: "Tech",
          publishedAt: "2026-05-27T11:00:00.000Z",
          categories: ["tech"]
        },
        {
          id: "tech-c",
          dedupGroupId: "dg-c",
          title: "Tech C",
          snippet: "C",
          canonicalUrl: "https://news.example.com/tech/c",
          sourceName: "Tech",
          publishedAt: "2026-05-27T10:00:00.000Z",
          categories: ["tech"]
        }
      ]
    });

    expect(result.items).toHaveLength(2);
  });
});
