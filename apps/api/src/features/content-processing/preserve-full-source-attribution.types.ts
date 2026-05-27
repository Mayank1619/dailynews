import type { ArticleProcessed, ArticleRaw, ProcessingRun } from "./contracts";

export interface PreserveFullSourceAttributionInput {
  rawArticles: ArticleRaw[];
  existingProcessed?: ArticleProcessed[];
  pipelineVersion?: string;
}

export interface PreserveFullSourceAttributionResult {
  processedArticles: ArticleProcessed[];
  run: ProcessingRun;
}
