import type { ArticleProcessed } from "./contracts";
import { assignTaxonomyCategories, CONTENT_PROCESSING_PIPELINE_VERSION } from "./versioning";
import type { AssignTaxonomyCategoriesToStoriesInput, AssignTaxonomyCategoriesToStoriesResult, CategorizedArticle } from "./assign-taxonomy-categories-to-stories.types";
import { AssignTaxonomyCategoriesTelemetry } from "./assign-taxonomy-categories-to-stories.telemetry";

export class AssignTaxonomyCategoriesToStoriesService {
  constructor(private readonly telemetry = new AssignTaxonomyCategoriesTelemetry()) {}

  assignCategories(input: AssignTaxonomyCategoriesToStoriesInput): AssignTaxonomyCategoriesToStoriesResult {
    const pipelineVersion = input.pipelineVersion ?? CONTENT_PROCESSING_PIPELINE_VERSION;
    const articles: CategorizedArticle[] = input.articles.map((article) => {
      const categories = assignTaxonomyCategories(`${article.title} ${article.snippet}`);

      if (categories.length === 0) {
        this.telemetry.recordNoCategoryMatch();
      }

      categories.forEach((category) => this.telemetry.recordCategoryAssignment(category));

      return {
        ...article,
        categories,
        needsReview: categories.length === 0
      };
    });

    return {
      articles,
      reviewQueueIds: articles.filter((article) => article.needsReview).map((article) => article.id),
      run: {
        id: `run_${Date.now()}`,
        batchSize: input.articles.length,
        newCount: articles.length,
        updatedCount: 0,
        failureCount: 0,
        pipelineVersion,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString()
      }
    };
  }
}
