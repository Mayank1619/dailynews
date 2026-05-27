import { ArticleRawRecord, ContentSourceRecord, IngestionRunRecord } from '../../../../api/src/features/content-ingestion/content-ingestion.types';

export const CONTENT_INGESTION_ROUTE = '/admin/content-ingestion';
export const CONTENT_INGESTION_CADENCE = 'Every 30-60 minutes';

export const SOURCE_TYPE_OPTIONS = ['RSS', 'API'] as const;

export const SOURCE_STATUS_LABELS = {
  enabled: 'Enabled source',
  disabled: 'Disabled source',
  eligible: 'Eligible for next run',
  skipped: 'Skipped by scheduler',
} as const;

export const DEFAULT_SOURCES: ContentSourceRecord[] = [
  {
    id: 'rss-tech',
    name: 'Tech Radar RSS',
    type: 'RSS',
    url: 'https://example.com/tech/rss',
    enabled: true,
    categoryHint: 'technology',
    createdAt: new Date('2026-05-01T08:00:00Z'),
    lastFetchedAt: new Date('2026-05-27T08:30:00Z'),
  },
  {
    id: 'api-world',
    name: 'World News API',
    type: 'API',
    url: 'https://example.com/world/api',
    enabled: false,
    categoryHint: 'world',
    createdAt: new Date('2026-05-01T08:10:00Z'),
  },
];

export const DEFAULT_INGESTION_RUN: IngestionRunRecord = {
  id: 'ingestion_20260527_083000',
  startedAt: new Date('2026-05-27T08:30:00Z'),
  finishedAt: new Date('2026-05-27T08:32:00Z'),
  successCount: 2,
  failureCount: 0,
  skippedDuplicates: 1,
  sourceOutcomes: [
    {
      sourceId: 'rss-tech',
      sourceName: 'Tech Radar RSS',
      sourceType: 'RSS',
      status: 'success',
      storedCount: 2,
      duplicateCount: 1,
      fetchedCount: 3,
      finishedAt: new Date('2026-05-27T08:31:10Z'),
      lastSuccessfulFetchAt: new Date('2026-05-27T08:31:00Z'),
    },
    {
      sourceId: 'api-world',
      sourceName: 'World News API',
      sourceType: 'API',
      status: 'skipped',
      storedCount: 0,
      duplicateCount: 0,
      fetchedCount: 0,
      reason: 'source_disabled',
      finishedAt: new Date('2026-05-27T08:31:20Z'),
    },
  ],
};

export const DEFAULT_ARTICLE: ArticleRawRecord = {
  id: 'article_tech_001',
  sourceId: 'rss-tech',
  title: 'City council approves transit upgrade',
  url: 'https://example.com/articles/transit-upgrade',
  publishedAt: new Date('2026-05-27T07:50:00Z'),
  author: 'Staff Writer',
  snippet: 'Officials approved a new transit corridor after months of debate.',
  fetchedAt: new Date('2026-05-27T08:31:00Z'),
  rawHash: 'rawhash-city-council-transit-upgrade',
};