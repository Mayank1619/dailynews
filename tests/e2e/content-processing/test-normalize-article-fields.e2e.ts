import { expect, test } from "@playwright/test";
import { NormalizeArticleFieldsService } from "../../../apps/api/src/features/content-processing/normalize-article-fields.service";

test("US3 e2e: normalization enforces clean fields", async () => {
  const service = new NormalizeArticleFieldsService();
  const result = service.normalize({
    rawArticles: [
      {
        id: "raw-e2e-1",
        sourceId: "source-a",
        title: "  AI startup launches new chip  ",
        url: "https://news.example.com/tech/chip?source=rss",
        publishedAt: "2026-05-27T08:30:00Z",
        fetchedAt: "2026-05-27T08:32:00Z",
        snippet: null,
        rawHash: "hash-e2e-tech"
      }
    ]
  });

  expect(result.normalizedArticles[0].title).toBe("AI startup launches new chip");
  expect(result.normalizedArticles[0].snippet).toBe("");
  expect(result.normalizedArticles[0].sources).toHaveLength(1);
});
