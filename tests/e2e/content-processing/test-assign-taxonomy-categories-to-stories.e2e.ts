import { expect, test } from "@playwright/test";
import { AssignTaxonomyCategoriesToStoriesService } from "../../../apps/api/src/features/content-processing/assign-taxonomy-categories-to-stories.service";

test("US2 e2e: category assignment returns controlled taxonomy values", async () => {
  const service = new AssignTaxonomyCategoriesToStoriesService();
  const result = service.assignCategories({
    articles: [
      {
        id: "article-e2e-1",
        dedupGroupId: "grp-e2e-1",
        canonicalUrl: "https://news.example.com/sports/final",
        title: "Championship game ends with late score",
        snippet: "The league final drew a huge crowd.",
        publishedAt: "2026-05-27T10:00:00Z",
        categories: [],
        sources: [{ sourceId: "source-a", url: "https://news.example.com/sports/final" }],
        processingTimestamp: "2026-05-27T10:05:00Z",
        pipelineVersion: "content-processing-v1.0.0"
      }
    ]
  });

  expect(result.articles[0].categories).toContain("sports");
});
