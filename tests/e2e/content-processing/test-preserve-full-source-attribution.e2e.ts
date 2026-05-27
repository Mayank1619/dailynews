import { expect, test } from "@playwright/test";
import { PreserveFullSourceAttributionService } from "../../../apps/api/src/features/content-processing/preserve-full-source-attribution.service";

test("US4 e2e: attribution survives processing transforms", async () => {
  const service = new PreserveFullSourceAttributionService();
  const result = service.preserve({
    rawArticles: [
      {
        id: "raw-e2e-1",
        sourceId: "source-a",
        title: "Local leaders approve new transit plan",
        url: "https://news.example.com/local/transit",
        publishedAt: "2026-05-27T09:00:00Z",
        fetchedAt: "2026-05-27T09:01:00Z",
        snippet: "The transit board voted after debate.",
        rawHash: "hash-e2e-attribution-1"
      },
      {
        id: "raw-e2e-2",
        sourceId: "source-b",
        title: "Transit plan approved by local leaders",
        url: "https://news.example.com/local/transit/",
        publishedAt: "2026-05-27T09:02:00Z",
        fetchedAt: "2026-05-27T09:03:00Z",
        snippet: "Another newsroom preserved the full source list.",
        rawHash: "hash-e2e-attribution-2"
      }
    ]
  });

  expect(result.processedArticles[0].sources).toHaveLength(2);
});
