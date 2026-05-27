export type TaxonomyCategory =
  | "politics"
  | "markets"
  | "crime"
  | "tech"
  | "sports"
  | "horoscope"
  | "local";

export interface SourceAttribution {
  sourceId: string;
  url: string;
}

export interface ArticleRaw {
  id: string;
  sourceId: string;
  title: string;
  url?: string | null;
  publishedAt: string | Date;
  author?: string | null;
  snippet?: string | null;
  fetchedAt: string | Date;
  rawHash?: string | null;
}

export interface ArticleProcessed {
  id: string;
  dedupGroupId: string;
  title: string;
  snippet: string;
  canonicalUrl: string;
  publishedAt: string;
  categories: TaxonomyCategory[];
  sources: SourceAttribution[];
  processingTimestamp: string;
  pipelineVersion: string;
  scoreSignals?: Record<string, unknown>;
}

export interface DedupGroup {
  dedupGroupId: string;
  canonicalUrl: string;
  memberRawIds: string[];
}

export interface ProcessingRun {
  id: string;
  batchSize: number;
  newCount: number;
  updatedCount: number;
  failureCount: number;
  pipelineVersion: string;
  startedAt: string;
  finishedAt: string;
}

export interface ProcessingFailure {
  rawArticleId: string;
  stage: string;
  reason: string;
}
