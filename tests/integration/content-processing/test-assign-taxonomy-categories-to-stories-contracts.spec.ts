import { describe, expect, it } from "vitest";
import { AssignTaxonomyCategoriesToStoriesService } from "../../../apps/api/src/features/content-processing/assign-taxonomy-categories-to-stories.service";

describe("US2 integration: taxonomy contract", () => {
  it("keeps only controlled taxonomy categories on processed articles", () => {
    const service = new AssignTaxonomyCategoriesToStoriesService();
    const result = service.assignCategories({
      articles: [
        {
          id: "article-contract-1",
          dedupGroupId: "grp-contract-1",
          canonicalUrl: "https://news.example.com/local/crime",
          title: "Police and city council respond to local crime report",
          snippet: "The local district saw an arrest after an investigation.",
          publishedAt: "2026-05-27T09:00:00Z",
          categories: [],
          sources: [{ sourceId: "source-a", url: "https://news.example.com/local/crime" }],
          processingTimestamp: "2026-05-27T09:05:00Z",
          pipelineVersion: "content-processing-v1.0.0"
        }
      ]
    });

    expect(result.articles[0].categories.every((category) => ["politics", "markets", "crime", "tech", "sports", "horoscope", "local"].includes(category))).toBe(true);
  });
});
