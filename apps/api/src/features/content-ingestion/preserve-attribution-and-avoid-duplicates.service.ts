import {
  ArticleRawRecord,
  buildArticleRawRecord,
  InMemoryIngestionRepository,
  IngestionRepository,
  isDuplicateArticle,
  normalizeCanonicalUrl,
} from './content-ingestion.types';
import { AttributionBatchResult, AttributionInput, AttributionSummary, DeduplicationDecision } from './preserve-attribution-and-avoid-duplicates.types';
import { PreserveAttributionAndAvoidDuplicatesTelemetry } from './preserve-attribution-and-avoid-duplicates.telemetry';

export class PreserveAttributionAndAvoidDuplicatesService {
  constructor(
    private readonly repository: IngestionRepository = new InMemoryIngestionRepository(),
    private readonly telemetry: PreserveAttributionAndAvoidDuplicatesTelemetry = new PreserveAttributionAndAvoidDuplicatesTelemetry(),
  ) {}

  storeArticle(input: AttributionInput, fetchedAt: Date = new Date()): DeduplicationDecision {
    const article = buildArticleRawRecord(input.source.id, input.article, fetchedAt);
    const duplicate = isDuplicateArticle(this.repository.listArticles(), article);

    if (duplicate) {
      this.telemetry.record({
        sourceId: input.source.id,
        event: 'duplicate_skipped',
        details: {
          canonicalUrl: article.url,
          rawHash: article.rawHash,
        },
      });

      return {
        stored: false,
        reason: this.repository.hasArticleByCanonicalIdentity(article.url, article.rawHash) ? 'duplicate_raw_hash' : 'duplicate_url',
      };
    }

    const saved = this.repository.saveArticle(article);
    this.telemetry.record({
      sourceId: input.source.id,
      event: 'stored',
      details: {
        canonicalUrl: saved.url,
        rawHash: saved.rawHash,
      },
    });

    return {
      stored: true,
      article: saved,
    };
  }

  storeBatch(input: AttributionInput, fetchedAt: Date = new Date()): AttributionBatchResult {
    const result: AttributionBatchResult = {
      stored: 0,
      duplicatesSkipped: 0,
      articles: [],
    };

    const decision = this.storeArticle(input, fetchedAt);
    if (decision.stored && decision.article) {
      result.stored += 1;
      result.articles.push(decision.article);
    } else {
      result.duplicatesSkipped += 1;
    }

    return result;
  }

  storeArticles(source: AttributionInput['source'], articles: AttributionInput['article'][], fetchedAt: Date = new Date()): AttributionBatchResult {
    const result: AttributionBatchResult = {
      stored: 0,
      duplicatesSkipped: 0,
      articles: [],
    };

    for (const article of articles) {
      const decision = this.storeArticle({ source, article }, fetchedAt);
      if (decision.stored && decision.article) {
        result.stored += 1;
        result.articles.push(decision.article);
      } else {
        result.duplicatesSkipped += 1;
      }
    }

    return result;
  }

  listArticles(): ArticleRawRecord[] {
    return this.repository.listArticles();
  }

  buildSummary(article: ArticleRawRecord, sourceName: string, sourceUrl: string): AttributionSummary {
    return {
      sourceId: article.sourceId,
      sourceName,
      sourceUrl,
      canonicalUrl: normalizeCanonicalUrl(article.url),
      rawHash: article.rawHash,
    };
  }

  getTelemetry(): PreserveAttributionAndAvoidDuplicatesTelemetry {
    return this.telemetry;
  }
}