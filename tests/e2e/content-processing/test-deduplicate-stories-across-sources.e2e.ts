import { expect, test } from "@playwright/test";
import { DeduplicateStoriesAcrossSourcesService } from "../../../apps/api/src/features/content-processing/deduplicate-stories-across-sources.service";

test("US1 e2e: duplicate corpus collapses to one canonical story", async () => {
  const service = new DeduplicateStoriesAcrossSourcesService();
  const result = service.deduplicate({
    rawArticles: [
      {
        id: "raw-e2e-1",
        sourceId: "source-a",
        title: "Markets rally after earnings surprise",
        url: "https://news.example.com/markets/rally",
        publishedAt: "2026-05-27T06:00:00Z",
        fetchedAt: "2026-05-27T06:03:00Z",
        snippet: "Stocks moved higher after earnings.",
        rawHash: "hash-e2e-1"
      },
      {
        id: "raw-e2e-2",
        sourceId: "source-b",
        title: "Earnings surprise sparks markets rally",
        url: "https://news.example.com/markets/rally/",
        publishedAt: "2026-05-27T06:02:00Z",
        fetchedAt: "2026-05-27T06:04:00Z",
        snippet: "The same market move was reported elsewhere.",
        rawHash: "hash-e2e-2"
      }
    ]
  });

  expect(result.processedArticles).toHaveLength(1);
  expect(result.processedArticles[0].sources).toHaveLength(2);
});
