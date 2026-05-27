import { describe, expect, it } from 'vitest';
import { InMemoryIngestionRepository } from '../../../apps/api/src/features/content-ingestion/content-ingestion.types';
import { PreserveAttributionAndAvoidDuplicatesService } from '../../../apps/api/src/features/content-ingestion/preserve-attribution-and-avoid-duplicates.service';

describe('Content ingestion US3 unit: preserve attribution and avoid duplicates', () => {
  it('stores a single canonical article and preserves source attribution', () => {
    const repository = new InMemoryIngestionRepository();
    const service = new PreserveAttributionAndAvoidDuplicatesService(repository);

    const source = {
      id: 'rss-attribution',
      name: 'Attribution RSS',
      type: 'RSS' as const,
      url: 'https://example.com/attribution/rss',
      enabled: true,
      createdAt: new Date('2026-05-27T08:00:00Z'),
    };

    const first = service.storeArticle(
      {
        source,
        article: {
          title: 'Duplicate-aware article',
          url: 'https://example.com/articles/duplicate-aware-article?utm_source=rss',
          publishedAt: new Date('2026-05-27T08:10:00Z'),
          author: 'Reporter',
        },
      },
      new Date('2026-05-27T08:30:00Z'),
    );

    const second = service.storeArticle(
      {
        source,
        article: {
          title: 'Duplicate-aware article',
          url: 'https://example.com/articles/duplicate-aware-article',
          publishedAt: new Date('2026-05-27T08:10:00Z'),
        },
      },
      new Date('2026-05-27T08:40:00Z'),
    );

    expect(first.stored).toBe(true);
    expect(second.stored).toBe(false);
    expect(service.listArticles()).toHaveLength(1);
    expect(service.listArticles()[0].sourceId).toBe('rss-attribution');
    expect(service.listArticles()[0].url).toBe('https://example.com/articles/duplicate-aware-article');
  });
});