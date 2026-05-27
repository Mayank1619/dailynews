import type { ArticleProcessed, ArticleRaw, ProcessingRun } from "./contracts";

export interface IdempotentAndPipelineVersionTrackedProcessingInput {
  rawArticles: ArticleRaw[];
  existingProcessed?: ArticleProcessed[];
  pipelineVersion?: string;
}

export interface IdempotentAndPipelineVersionTrackedProcessingResult {
  processedArticles: ArticleProcessed[];
  run: ProcessingRun;
}
