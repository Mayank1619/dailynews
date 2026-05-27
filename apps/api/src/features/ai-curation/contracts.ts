export interface CurationSourceAttribution {
  sourceName: string;
  canonicalUrl: string;
}

export interface ProcessedArticle {
  id: string;
  dedupGroupId: string;
  title: string;
  snippet: string;
  canonicalUrl: string;
  sourceName: string;
  publishedAt: string;
  categories: string[];
}

export interface CurationUserPreference {
  userId: string;
  topics: string[];
}

export interface ModelInfo {
  modelName: string | null;
  modelVersion: string | null;
  invokedAt: string | null;
}

export interface ArticleSummaryRecord {
  id: string;
  processedArticleId: string;
  title: string;
  summaryText: string | null;
  bulletPoints: string[];
  fallbackApplied: boolean;
  source: CurationSourceAttribution;
  modelInfo: ModelInfo;
  rankedScore: number;
  categories: string[];
  summaryLabel: "Summary" | null;
  publishedAt: string;
}

export interface CurationMetrics {
  articlesEvaluated: number;
  aiSummariesGenerated: number;
  cacheHits: number;
  fallbacksApplied: number;
  failures: number;
}
