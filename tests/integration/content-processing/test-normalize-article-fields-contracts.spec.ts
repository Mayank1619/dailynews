import { describe, expect, it } from "vitest";
import { NormalizeArticleFieldsService } from "../../../apps/api/src/features/content-processing/normalize-article-fields.service";

describe("US3 integration: normalization contract", () => {
  it("produces canonical ISO timestamps and source attribution", () => {
    const service = new NormalizeArticleFieldsService();
    const result = service.normalize({
      rawArticles: [
        {
          id: "raw-contract-1",
          sourceId: "source-a",
          title: "   Stock market opens higher   ",
          url: "https://news.example.com/markets/opening/",
          publishedAt: "2026-05-27T06:00:00-04:00",
          fetchedAt: "2026-05-27T06:01:00Z",
          snippet: "  Markets rallied at the open.  ",
          rawHash: "hash-market-open"
        }
      ]
    });

    expect(result.normalizedArticles[0].title).toBe("Stock market opens higher");
    expect(result.normalizedArticles[0].snippet).toBe("Markets rallied at the open.");
    expect(result.normalizedArticles[0].sources[0].sourceId).toBe("source-a");
    expect(result.normalizedArticles[0].publishedAt).toBe("2026-05-27T10:00:00.000Z");
  });
});
