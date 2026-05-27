import { describe, expect, it } from "vitest";
import { ReceiveARankedSummarizedDigestOfRelevantStoriesService } from "../../../apps/api/src/features/ai-curation/receive-a-ranked-summarized-digest-of-relevant-stories.service";
import type { CurationSummarizer } from "../../../apps/api/src/features/ai-curation/receive-a-ranked-summarized-digest-of-relevant-stories.types";

describe("US3 unit: readable fallback digest on summarizer failures", () => {
  it("applies fallback when summarizer throws", async () => {
    const failingSummarizer: CurationSummarizer = {
      summarize: async () => {
        throw new Error("model_unavailable");
      }
    };

    const service = new ReceiveARankedSummarizedDigestOfRelevantStoriesService(failingSummarizer);

    const result = await service.curate({
      preference: { userId: "u-fallback", topics: ["tech"] },
      articles: [
        {
          id: "fallback-1",
          dedupGroupId: "dg-fallback-1",
          title: "Fallback test article",
          snippet: "This snippet should still be rendered.",
          canonicalUrl: "https://news.example.com/fallback",
          sourceName: "Fallback News",
          publishedAt: "2026-05-27T10:00:00.000Z",
          categories: ["tech"]
        }
      ]
    });

    expect(result.items[0].fallbackApplied).toBe(true);
    expect(result.items[0].summaryLabel).toBeNull();
    expect(result.items[0].summaryText).toContain("Fallback test article");
  });
});
