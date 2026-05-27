import type { ArticleProcessed, ArticleRaw, ProcessingRun } from "./contracts";

export interface NormalizeArticleFieldsInput {
  rawArticles: ArticleRaw[];
  pipelineVersion?: string;
}

export interface NormalizeArticleFieldsResult {
  normalizedArticles: ArticleProcessed[];
  skippedRawArticleIds: string[];
  run: ProcessingRun;
}
