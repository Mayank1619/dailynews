export interface ProcessedArticleInput {
  id: string;
  dedupGroupId: string;
  title: string;
  snippet: string;
  canonicalUrl: string;
  sourceName: string;
  publishedAt: string;
  categories: string[];
}

export interface ModelInfo {
  modelName: string | null;
  modelVersion: string | null;
  invokedAt: string | null;
}

export interface ModelSummaryResponse {
  summaryText: string | null;
  bulletPoints: string[];
  modelInfo: ModelInfo;
}

export interface ModelGateway {
  summarizeArticle(article: ProcessedArticleInput): Promise<ModelSummaryResponse>;
}

export interface CurationTelemetryEvent {
  eventType: "article_evaluated" | "ai_summary_generated" | "cache_hit" | "fallback_applied" | "pipeline_failure";
  processedArticleId: string;
  timestamp: string;
  reason?: string;
}

export interface CurationTelemetrySnapshot {
  articlesEvaluated: number;
  aiSummariesGenerated: number;
  cacheHits: number;
  fallbacksApplied: number;
  failures: number;
  events: CurationTelemetryEvent[];
}
