import type { ArticleSummaryRecord, CurationMetrics, CurationUserPreference, ModelInfo, ProcessedArticle } from "./contracts";

export interface ReceiveARankedSummarizedDigestInput {
  articles: ProcessedArticle[];
  preference: CurationUserPreference;
  perCategoryLimit?: number;
  cache?: Map<string, ArticleSummaryRecord>;
}

export interface SummarizerResult {
  summaryText: string | null;
  bulletPoints: string[];
  modelInfo: ModelInfo;
}

export interface CurationSummarizer {
  summarize(article: ProcessedArticle): Promise<SummarizerResult>;
}

export interface RankedDigestResult {
  items: ArticleSummaryRecord[];
  metrics: CurationMetrics;
}
