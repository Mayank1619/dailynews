import { describe, expect, it } from "vitest";
import { PreserveFullSourceAttributionService } from "../../../apps/api/src/features/content-processing/preserve-full-source-attribution.service";

describe("US4 unit: preserve full source attribution", () => {
  it("retains every source entry after deduplication", () => {
    const service = new PreserveFullSourceAttributionService();
    const result = service.preserve({
      rawArticles: [
        {
          id: "raw-1",
          sourceId: "source-a",
          title: "Sports final ends in dramatic finish",
          url: "https://news.example.com/sports/final",
          publishedAt: "2026-05-27T08:00:00Z",
          fetchedAt: "2026-05-27T08:02:00Z",
          snippet: "The championship game was decided late.",
          rawHash: "hash-sports-1"
        },
        {
          id: "raw-2",
          sourceId: "source-b",
          title: "Dramatic finish decides sports final",
          url: "https://news.example.com/sports/final/",
          publishedAt: "2026-05-27T08:04:00Z",
          fetchedAt: "2026-05-27T08:06:00Z",
          snippet: "The same result was reported from another source.",
          rawHash: "hash-sports-2"
        },
        {
          id: "raw-3",
          sourceId: "source-c",
          title: "Late finish decides championship game",
          url: "https://news.example.com/sports/final?ref=partner",
          publishedAt: "2026-05-27T08:05:00Z",
          fetchedAt: "2026-05-27T08:07:00Z",
          snippet: "A third outlet carried the same attribution.",
          rawHash: "hash-sports-3"
        }
      ]
    });

    expect(result.processedArticles).toHaveLength(1);
    expect(result.processedArticles[0].sources).toEqual([
      { sourceId: "source-a", url: "https://news.example.com/sports/final" },
      { sourceId: "source-b", url: "https://news.example.com/sports/final/" },
      { sourceId: "source-c", url: "https://news.example.com/sports/final?ref=partner" }
    ]);
  });
});
