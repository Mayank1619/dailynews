import type { PreserveFullSourceAttributionInput, PreserveFullSourceAttributionResult } from "./preserve-full-source-attribution.types";
import { DeduplicateStoriesAcrossSourcesService } from "./deduplicate-stories-across-sources.service";
import { PreserveFullSourceAttributionTelemetry } from "./preserve-full-source-attribution.telemetry";

export class PreserveFullSourceAttributionService {
  constructor(
    private readonly deduplicator = new DeduplicateStoriesAcrossSourcesService(),
    private readonly telemetry = new PreserveFullSourceAttributionTelemetry()
  ) {}

  preserve(input: PreserveFullSourceAttributionInput): PreserveFullSourceAttributionResult {
    const result = this.deduplicator.deduplicate(input);
    this.telemetry.recordRawArticlesIngested(input.rawArticles.length);
    this.telemetry.recordNormalizedArticles(result.processedArticles.length);

    return {
      processedArticles: result.processedArticles.map((article) => ({
        ...article,
        sources: [...article.sources]
      })),
      run: result.run
    };
  }
}
