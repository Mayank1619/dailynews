import { describe, expect, it } from "vitest";
import { NormalizeArticleFieldsService } from "../../../apps/api/src/features/content-processing/normalize-article-fields.service";

describe("US3 unit: normalize article fields", () => {
  it("trims fields and resolves canonical output formats", () => {
    const service = new NormalizeArticleFieldsService();
    const result = service.normalize({
      rawArticles: [
        {
          id: "raw-1",
          sourceId: "source-a",
          title: "  Local leaders announce transit changes  ",
          url: "https://news.example.com/local/transit?utm_source=feed",
          publishedAt: "2026-05-27T07:55:00-05:00",
          fetchedAt: "2026-05-27T08:01:00Z",
          snippet: null,
          rawHash: "hash-local-transit"
        }
      ]
    });

    expect(result.normalizedArticles[0].title).toBe("Local leaders announce transit changes");
    expect(result.normalizedArticles[0].snippet).toBe("");
    expect(result.normalizedArticles[0].canonicalUrl).toBe("https://news.example.com/local/transit");
    expect(result.normalizedArticles[0].publishedAt).toBe("2026-05-27T12:55:00.000Z");
    expect(result.normalizedArticles[0].sources).toHaveLength(1);
  });

  it("uses a raw hash fallback when no url is present", () => {
    const service = new NormalizeArticleFieldsService();
    const result = service.normalize({
      rawArticles: [
        {
          id: "raw-2",
          sourceId: "source-b",
          title: "Breaking update without canonical url",
          url: null,
          publishedAt: "2026-05-27T08:00:00Z",
          fetchedAt: "2026-05-27T08:05:00Z",
          snippet: "Short summary",
          rawHash: "hash-fallback"
        }
      ]
    });

    expect(result.normalizedArticles[0].canonicalUrl).toBe("urn:rawhash:hash-fallback");
  });
});
