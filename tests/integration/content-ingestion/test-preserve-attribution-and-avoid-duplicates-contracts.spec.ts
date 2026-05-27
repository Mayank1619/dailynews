import { describe, expect, it } from 'vitest';
import { InMemoryIngestionRepository } from '../../../apps/api/src/features/content-ingestion/content-ingestion.types';
import { PreserveAttributionAndAvoidDuplicatesService } from '../../../apps/api/src/features/content-ingestion/preserve-attribution-and-avoid-duplicates.service';

describe('Content ingestion US3 integration: attribution and dedup contracts', () => {
  it('keeps one canonical article when the same content appears twice', () => {
    const service = new PreserveAttributionAndAvoidDuplicatesService(new InMemoryIngestionRepository());

    const source = {
      id: 'api-dup',
      name: 'Dup API',
      type: 'API' as const,
      url: 'https://example.com/dup/api',
      enabled: true,
      createdAt: new Date('2026-05-27T08:00:00Z'),
    };

    const result = service.storeArticles(source, [
      {
        title: 'Repeat headline',
        url: 'https://example.com/articles/repeat-headline?ref=a',
        publishedAt: new Date('2026-05-27T08:05:00Z'),
      },
      {
        title: 'Repeat headline',
        url: 'https://example.com/articles/repeat-headline?ref=b',
        publishedAt: new Date('2026-05-27T08:05:00Z'),
      },
    ]);

    expect(result.stored).toBe(1);
    expect(result.duplicatesSkipped).toBe(1);
    expect(result.articles[0].sourceId).toBe('api-dup');
  });
});