import type { ArticleProcessed, ProcessingRun, TaxonomyCategory } from "./contracts";

export interface AssignTaxonomyCategoriesToStoriesInput {
  articles: ArticleProcessed[];
  pipelineVersion?: string;
}

export interface CategorizedArticle extends ArticleProcessed {
  needsReview: boolean;
}

export interface AssignTaxonomyCategoriesToStoriesResult {
  articles: CategorizedArticle[];
  reviewQueueIds: string[];
  run: ProcessingRun;
}

export interface TaxonomyCategoryAssignment {
  articleId: string;
  categories: TaxonomyCategory[];
}
