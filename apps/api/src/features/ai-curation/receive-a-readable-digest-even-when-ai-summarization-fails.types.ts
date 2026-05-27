import type { ArticleSummaryRecord, ProcessedArticle } from "./contracts";

export interface ReceiveAReadableDigestWhenSummarizationFailsInput {
  failedArticles: ProcessedArticle[];
}

export interface ReceiveAReadableDigestWhenSummarizationFailsResult {
  fallbackItems: ArticleSummaryRecord[];
}
