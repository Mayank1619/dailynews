import type { ArticleSummaryRecord } from "./contracts";
import type {
  ReceiveAReadableDigestWhenSummarizationFailsInput,
  ReceiveAReadableDigestWhenSummarizationFailsResult
} from "./receive-a-readable-digest-even-when-ai-summarization-fails.types";
import { ReceiveAReadableDigestWhenSummarizationFailsTelemetry } from "./receive-a-readable-digest-even-when-ai-summarization-fails.telemetry";

export class ReceiveAReadableDigestWhenAiSummarizationFailsService {
  constructor(private readonly telemetry = new ReceiveAReadableDigestWhenSummarizationFailsTelemetry()) {}

  buildFallbackDigest(
    input: ReceiveAReadableDigestWhenSummarizationFailsInput
  ): ReceiveAReadableDigestWhenSummarizationFailsResult {
    const fallbackItems: ArticleSummaryRecord[] = input.failedArticles.map((article) => {
      this.telemetry.recordArticleEvaluated();
      this.telemetry.recordFallbackApplied();

      return {
        id: `sum_${article.id}`,
        processedArticleId: article.id,
        title: article.title,
        summaryText: [article.title, article.snippet].filter(Boolean).join(" - "),
        bulletPoints: [],
        fallbackApplied: true,
        source: {
          sourceName: article.sourceName,
          canonicalUrl: article.canonicalUrl
        },
        modelInfo: {
          modelName: null,
          modelVersion: null,
          invokedAt: null
        },
        rankedScore: Date.parse(article.publishedAt) || 0,
        categories: article.categories,
        summaryLabel: null,
        publishedAt: article.publishedAt
      };
    });

    return { fallbackItems };
  }
}
