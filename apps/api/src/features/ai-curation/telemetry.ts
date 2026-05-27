import type { CurationMetrics } from "./contracts";

export class AiCurationTelemetry {
  private readonly metrics: CurationMetrics = {
    articlesEvaluated: 0,
    aiSummariesGenerated: 0,
    cacheHits: 0,
    fallbacksApplied: 0,
    failures: 0
  };

  recordArticleEvaluated(count = 1): void {
    this.metrics.articlesEvaluated += count;
  }

  recordAiSummaryGenerated(count = 1): void {
    this.metrics.aiSummariesGenerated += count;
  }

  recordCacheHit(count = 1): void {
    this.metrics.cacheHits += count;
  }

  recordFallbackApplied(count = 1): void {
    this.metrics.fallbacksApplied += count;
  }

  recordFailure(count = 1): void {
    this.metrics.failures += count;
  }

  getSnapshot(): CurationMetrics {
    return { ...this.metrics };
  }
}
