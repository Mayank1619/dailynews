import type { ArticleProcessed, ArticleRaw, DedupGroup, ProcessingRun } from "./contracts";

export interface DeduplicateStoriesAcrossSourcesInput {
  rawArticles: ArticleRaw[];
  existingProcessed?: ArticleProcessed[];
  pipelineVersion?: string;
}

export interface DeduplicateStoriesAcrossSourcesResult {
  processedArticles: ArticleProcessed[];
  dedupGroups: DedupGroup[];
  run: ProcessingRun;
}

export interface DeduplicationDecision {
  rawArticleId: string;
  dedupGroupId: string;
  matchReason: "canonical-url" | "raw-hash" | "title-similarity" | "single-source";
  similarityScore?: number;
}
