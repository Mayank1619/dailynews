import { describe, expect, it } from "vitest";
import { DeduplicateStoriesAcrossSourcesService } from "../../../apps/api/src/features/content-processing/deduplicate-stories-across-sources.service";

describe("US1 unit: deduplicate stories across sources", () => {
  it("groups identical canonical URLs into one processed story", () => {
    const service = new DeduplicateStoriesAcrossSourcesService();
    const result = service.deduplicate({
      rawArticles: [
        {
          id: "raw-1",
          sourceId: "source-a",
          title: "Central bank warns of inflation risks",
          url: "https://news.example.com/story/123?ref=home",
          publishedAt: "2026-05-27T08:00:00Z",
          fetchedAt: "2026-05-27T08:05:00Z",
          snippet: "Officials said price pressures may persist.",
          rawHash: "hash-central-bank"
        },
        {
          id: "raw-2",
          sourceId: "source-b",
          title: "Inflation risks warned by central bank",
          url: "https://news.example.com/story/123/",
          publishedAt: "2026-05-27T08:02:00Z",
          fetchedAt: "2026-05-27T08:07:00Z",
          snippet: "The same story from another desk.",
          rawHash: "hash-central-bank-2"
        }
      ]
    });

    expect(result.processedArticles).toHaveLength(1);
    expect(result.processedArticles[0].sources).toHaveLength(2);
    expect(result.processedArticles[0].dedupGroupId).toBeTruthy();
  });

  it("groups highly similar titles when canonical URLs differ", () => {
    const service = new DeduplicateStoriesAcrossSourcesService();
    const result = service.deduplicate({
      rawArticles: [
        {
          id: "raw-a",
          sourceId: "source-a",
          title: "Local leaders approve transit plan",
          url: "https://example.com/local/a",
          publishedAt: "2026-05-27T09:00:00Z",
          fetchedAt: "2026-05-27T09:01:00Z",
          snippet: "Transit changes were approved.",
          rawHash: "hash-a"
        },
        {
          id: "raw-b",
          sourceId: "source-b",
          title: "Transit plan approved by local leaders",
          url: "https://example.com/local/b",
          publishedAt: "2026-05-27T09:03:00Z",
          fetchedAt: "2026-05-27T09:04:00Z",
          snippet: "Another desk described the same vote.",
          rawHash: "hash-b"
        }
      ]
    });

    expect(result.processedArticles).toHaveLength(1);
    expect(result.processedArticles[0].dedupGroupId).toBeTruthy();
    expect(result.dedupGroups[0].memberRawIds).toEqual(["raw-a", "raw-b"]);
  });
});
