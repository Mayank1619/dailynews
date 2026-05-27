import { describe, expect, it } from "vitest";
import { AssignTaxonomyCategoriesToStoriesService } from "../../../apps/api/src/features/content-processing/assign-taxonomy-categories-to-stories.service";

describe("US2 unit: assign taxonomy categories to stories", () => {
  it("assigns multiple taxonomy categories when keywords match", () => {
    const service = new AssignTaxonomyCategoriesToStoriesService();
    const result = service.assignCategories({
      articles: [
        {
          id: "article-1",
          dedupGroupId: "grp-1",
          canonicalUrl: "https://news.example.com/politics-tech",
          title: "Election officials use AI tools",
          snippet: "Government election teams adopted a new software platform.",
          publishedAt: "2026-05-27T08:00:00Z",
          categories: [],
          sources: [{ sourceId: "source-a", url: "https://news.example.com/politics-tech" }],
          processingTimestamp: "2026-05-27T08:05:00Z",
          pipelineVersion: "content-processing-v1.0.0"
        }
      ]
    });

    expect(result.articles[0].categories).toEqual(["politics", "tech"]);
    expect(result.reviewQueueIds).toHaveLength(0);
  });

  it("flags uncategorized stories for review", () => {
    const service = new AssignTaxonomyCategoriesToStoriesService();
    const result = service.assignCategories({
      articles: [
        {
          id: "article-2",
          dedupGroupId: "grp-2",
          canonicalUrl: "https://news.example.com/feature/story",
          title: "A quiet feature story",
          snippet: "No obvious taxonomy keywords are present.",
          publishedAt: "2026-05-27T08:10:00Z",
          categories: [],
          sources: [{ sourceId: "source-b", url: "https://news.example.com/feature/story" }],
          processingTimestamp: "2026-05-27T08:15:00Z",
          pipelineVersion: "content-processing-v1.0.0"
        }
      ]
    });

    expect(result.articles[0].categories).toEqual([]);
    expect(result.articles[0].needsReview).toBe(true);
    expect(result.reviewQueueIds).toEqual(["article-2"]);
  });
});
