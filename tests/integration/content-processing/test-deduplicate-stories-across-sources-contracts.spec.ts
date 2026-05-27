import { describe, expect, it } from "vitest";
import { DeduplicateStoriesAcrossSourcesService } from "../../../apps/api/src/features/content-processing/deduplicate-stories-across-sources.service";

describe("US1 integration: deduplication contract", () => {
  it("produces a single processed record with both sources preserved", () => {
    const service = new DeduplicateStoriesAcrossSourcesService();
    const result = service.deduplicate({
      rawArticles: [
        {
          id: "raw-contract-1",
          sourceId: "source-a",
          title: "Election results shift after late ballots",
          url: "https://news.example.com/politics/election",
          publishedAt: "2026-05-27T07:00:00Z",
          fetchedAt: "2026-05-27T07:05:00Z",
          snippet: "Late ballots changed the outcome.",
          rawHash: "hash-election-1"
        },
        {
          id: "raw-contract-2",
          sourceId: "source-b",
          title: "Late ballots shift election result",
          url: "https://news.example.com/politics/election/",
          publishedAt: "2026-05-27T07:03:00Z",
          fetchedAt: "2026-05-27T07:07:00Z",
          snippet: "Another newsroom described the same race.",
          rawHash: "hash-election-2"
        }
      ]
    });

    expect(result.processedArticles).toHaveLength(1);
    expect(result.processedArticles[0].sources.map((source) => source.sourceId)).toEqual(["source-a", "source-b"]);
    expect(result.run.batchSize).toBe(2);
  });
});
