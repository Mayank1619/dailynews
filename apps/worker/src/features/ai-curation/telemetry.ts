import type { CurationTelemetryEvent, CurationTelemetrySnapshot } from "./interfaces";

export class PrivacySafeCurationTelemetry {
  private articlesEvaluated = 0;
  private aiSummariesGenerated = 0;
  private cacheHits = 0;
  private fallbacksApplied = 0;
  private failures = 0;
  private readonly events: CurationTelemetryEvent[] = [];

  recordArticleEvaluated(processedArticleId: string): void {
    this.articlesEvaluated += 1;
    this.pushEvent("article_evaluated", processedArticleId);
  }

  recordAiSummaryGenerated(processedArticleId: string): void {
    this.aiSummariesGenerated += 1;
    this.pushEvent("ai_summary_generated", processedArticleId);
  }

  recordCacheHit(processedArticleId: string): void {
    this.cacheHits += 1;
    this.pushEvent("cache_hit", processedArticleId);
  }

  recordFallbackApplied(processedArticleId: string, reason: string): void {
    this.fallbacksApplied += 1;
    this.pushEvent("fallback_applied", processedArticleId, reason);
  }

  recordFailure(processedArticleId: string, reason: string): void {
    this.failures += 1;
    this.pushEvent("pipeline_failure", processedArticleId, reason);
  }

  getSnapshot(): CurationTelemetrySnapshot {
    return {
      articlesEvaluated: this.articlesEvaluated,
      aiSummariesGenerated: this.aiSummariesGenerated,
      cacheHits: this.cacheHits,
      fallbacksApplied: this.fallbacksApplied,
      failures: this.failures,
      events: [...this.events]
    };
  }

  private pushEvent(eventType: CurationTelemetryEvent["eventType"], processedArticleId: string, reason?: string): void {
    this.events.push({
      eventType,
      processedArticleId,
      timestamp: new Date().toISOString(),
      reason
    });
  }
}
