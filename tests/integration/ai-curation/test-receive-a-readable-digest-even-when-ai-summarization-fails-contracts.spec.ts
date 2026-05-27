import { describe, expect, it } from "vitest";
import { ReceiveAReadableDigestWhenAiSummarizationFailsService } from "../../../apps/api/src/features/ai-curation/receive-a-readable-digest-even-when-ai-summarization-fails.service";

describe("US3 integration: fallback digest contract", () => {
  it("returns title/snippet/canonicalUrl when summarization fails", () => {
    const service = new ReceiveAReadableDigestWhenAiSummarizationFailsService();

    const result = service.buildFallbackDigest({
      failedArticles: [
        {
          id: "failed-1",
          dedupGroupId: "dg-f1",
          title: "Summary service outage",
          snippet: "Pipeline switched to resilient fallback mode.",
          canonicalUrl: "https://news.example.com/ops/outage",
          sourceName: "Ops Desk",
          publishedAt: "2026-05-27T08:00:00.000Z",
          categories: ["tech"]
        }
      ]
    });

    expect(result.fallbackItems[0].fallbackApplied).toBe(true);
    expect(result.fallbackItems[0].summaryText).toContain("Summary service outage");
    expect(result.fallbackItems[0].source.canonicalUrl).toBe("https://news.example.com/ops/outage");
    expect(result.fallbackItems[0].modelInfo.modelName).toBeNull();
  });
});
