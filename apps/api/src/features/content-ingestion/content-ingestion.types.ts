import { createHash } from 'node:crypto';

export type ContentSourceType = 'RSS' | 'API';

export interface ContentSourceRecord {
  id: string;
  name: string;
  type: ContentSourceType;
  url: string;
  enabled: boolean;
  categoryHint?: string;
  createdAt: Date;
  lastFetchedAt?: Date;
}

export interface RawArticleInput {
  title: string;
  url: string;
  publishedAt: Date;
  author?: string;
  snippet?: string;
}

export interface ArticleRawRecord extends RawArticleInput {
  id: string;
  sourceId: string;
  fetchedAt: Date;
  rawHash: string;
}

export interface SourceOutcome {
  sourceId: string;
  sourceName: string;
  sourceType: ContentSourceType;
  status: 'success' | 'failure' | 'skipped';
  storedCount: number;
  duplicateCount: number;
  fetchedCount: number;
  reason?: string;
  finishedAt: Date;
  lastSuccessfulFetchAt?: Date;
}

export interface IngestionRunRecord {
  id: string;
  startedAt: Date;
  finishedAt: Date;
  successCount: number;
  failureCount: number;
  skippedDuplicates: number;
  sourceOutcomes: SourceOutcome[];
}

export interface IngestionConnectorResult {
  items: RawArticleInput[];
  fetchedAt: Date;
  sourceFingerprint?: string;
}

export interface IngestionConnector {
  sourceType: ContentSourceType;
  fetch(source: ContentSourceRecord): Promise<IngestionConnectorResult> | IngestionConnectorResult;
}

export interface IngestionRepository {
  listSources(): ContentSourceRecord[];
  getSource(sourceId: string): ContentSourceRecord | undefined;
  upsertSource(source: ContentSourceRecord): ContentSourceRecord;
  listArticles(): ArticleRawRecord[];
  hasArticleByCanonicalIdentity(canonicalUrl: string, rawHash: string): boolean;
  saveArticle(article: ArticleRawRecord): ArticleRawRecord;
  saveRun(run: IngestionRunRecord): IngestionRunRecord;
  listRuns(): IngestionRunRecord[];
}

export const DEFAULT_INGESTION_INTERVAL_MINUTES = 30;

export function normalizeCanonicalUrl(url: string): string {
  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);
    parsed.hash = '';
    parsed.search = '';
    parsed.hostname = parsed.hostname.toLowerCase();

    const pathname = parsed.pathname.replace(/\/+$/, '') || '/';
    parsed.pathname = pathname;

    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    return trimmed;
  }
}

export function calculateRawHash(input: Pick<RawArticleInput, 'title' | 'url' | 'publishedAt'>): string {
  const normalizedUrl = normalizeCanonicalUrl(input.url);
  const payload = [input.title.trim().toLowerCase(), normalizedUrl, input.publishedAt.toISOString()].join('|');

  return createHash('sha256').update(payload).digest('hex');
}

export function buildArticleRawRecord(sourceId: string, input: RawArticleInput, fetchedAt: Date = new Date()): ArticleRawRecord {
  const canonicalUrl = normalizeCanonicalUrl(input.url);
  const rawHash = calculateRawHash({
    title: input.title,
    url: canonicalUrl,
    publishedAt: input.publishedAt,
  });

  return {
    id: `article_${rawHash.slice(0, 16)}`,
    sourceId,
    title: input.title.trim(),
    url: canonicalUrl,
    publishedAt: input.publishedAt,
    author: input.author?.trim() || undefined,
    snippet: input.snippet?.trim() || undefined,
    fetchedAt,
    rawHash,
  };
}

export function isDuplicateArticle(existingArticles: ArticleRawRecord[], candidate: Pick<ArticleRawRecord, 'url' | 'rawHash'>): boolean {
  const canonicalUrl = normalizeCanonicalUrl(candidate.url);

  return existingArticles.some((article) => {
    return article.rawHash === candidate.rawHash || normalizeCanonicalUrl(article.url) === canonicalUrl;
  });
}

export function isSourceEligibleForFetch(
  source: ContentSourceRecord,
  now: Date = new Date(),
  minimumIntervalMinutes: number = DEFAULT_INGESTION_INTERVAL_MINUTES,
): boolean {
  if (!source.enabled) {
    return false;
  }

  if (!source.lastFetchedAt) {
    return true;
  }

  const elapsedMinutes = (now.getTime() - source.lastFetchedAt.getTime()) / 60000;
  return elapsedMinutes >= minimumIntervalMinutes;
}

export class InMemoryIngestionRepository implements IngestionRepository {
  private readonly sources = new Map<string, ContentSourceRecord>();
  private readonly articles = new Map<string, ArticleRawRecord>();
  private readonly runs: IngestionRunRecord[] = [];

  listSources(): ContentSourceRecord[] {
    return [...this.sources.values()].map((source) => ({ ...source }));
  }

  getSource(sourceId: string): ContentSourceRecord | undefined {
    const source = this.sources.get(sourceId);
    return source ? { ...source } : undefined;
  }

  upsertSource(source: ContentSourceRecord): ContentSourceRecord {
    const existing = this.sources.get(source.id);
    const nextSource: ContentSourceRecord = {
      ...source,
      createdAt: existing?.createdAt ?? source.createdAt,
      lastFetchedAt: source.lastFetchedAt ?? existing?.lastFetchedAt,
    };

    this.sources.set(source.id, { ...nextSource });
    return { ...nextSource };
  }

  listArticles(): ArticleRawRecord[] {
    return [...this.articles.values()].map((article) => ({ ...article }));
  }

  hasArticleByCanonicalIdentity(canonicalUrl: string, rawHash: string): boolean {
    const normalizedUrl = normalizeCanonicalUrl(canonicalUrl);

    return this.listArticles().some((article) => {
      return article.rawHash === rawHash || normalizeCanonicalUrl(article.url) === normalizedUrl;
    });
  }

  saveArticle(article: ArticleRawRecord): ArticleRawRecord {
    this.articles.set(article.rawHash, { ...article });
    return { ...article };
  }

  saveRun(run: IngestionRunRecord): IngestionRunRecord {
    this.runs.push({ ...run, sourceOutcomes: run.sourceOutcomes.map((outcome) => ({ ...outcome })) });
    return { ...run, sourceOutcomes: run.sourceOutcomes.map((outcome) => ({ ...outcome })) };
  }

  listRuns(): IngestionRunRecord[] {
    return this.runs.map((run) => ({ ...run, sourceOutcomes: run.sourceOutcomes.map((outcome) => ({ ...outcome })) }));
  }
}