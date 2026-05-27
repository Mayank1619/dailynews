import { describe, expect, it } from "vitest";
import { PreserveFullSourceAttributionService } from "../../../apps/api/src/features/content-processing/preserve-full-source-attribution.service";

describe("US4 integration: source attribution contract", () => {
  it("keeps three source entries in the processed record", () => {
    const service = new PreserveFullSourceAttributionService();
    const result = service.preserve({
      rawArticles: [
        {
          id: "raw-contract-1",
          sourceId: "source-a",
          title: "Election coverage from city hall",
          url: "https://news.example.com/politics/city-hall",
          publishedAt: "2026-05-27T07:00:00Z",
          fetchedAt: "2026-05-27T07:05:00Z",
          snippet: "Election results were discussed at city hall.",
          rawHash: "hash-politics-1"
        },
        {
          id: "raw-contract-2",
          sourceId: "source-b",
          title: "City hall election coverage",
          url: "https://news.example.com/politics/city-hall/",
          publishedAt: "2026-05-27T07:03:00Z",
          fetchedAt: "2026-05-27T07:07:00Z",
          snippet: "Another desk reported the same story.",
          rawHash: "hash-politics-2"
        },
        {
          id: "raw-contract-3",
          sourceId: "source-c",
          title: "Local officials talk election coverage",
          url: "https://news.example.com/politics/city-hall?ref=partner",
          publishedAt: "2026-05-27T07:04:00Z",
          fetchedAt: "2026-05-27T07:08:00Z",
          snippet: "A third source preserved attribution.",
          rawHash: "hash-politics-3"
        }
      ]
    });

    expect(result.processedArticles[0].sources).toHaveLength(3);
    expect(result.processedArticles[0].sources.every((source) => source.sourceId.startsWith("source-"))).toBe(true);
  });
});
