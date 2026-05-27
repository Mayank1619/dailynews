import type { ArticleRawRecord, ContentSourceRecord, RawArticleInput } from './content-ingestion.types';

export interface AttributionSummary {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  canonicalUrl: string;
  rawHash: string;
}

export interface DeduplicationDecision {
  stored: boolean;
  reason?: 'duplicate_url' | 'duplicate_raw_hash';
  article?: ArticleRawRecord;
}

export interface AttributionBatchResult {
  stored: number;
  duplicatesSkipped: number;
  articles: ArticleRawRecord[];
}

export interface AttributionInput {
  source: ContentSourceRecord;
  article: RawArticleInput;
}