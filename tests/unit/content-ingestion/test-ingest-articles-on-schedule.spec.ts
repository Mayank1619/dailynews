import { describe, expect, it } from 'vitest';
import { InMemoryIngestionRepository } from '../../../apps/api/src/features/content-ingestion/content-ingestion.types';
import { IngestArticlesOnScheduleService } from '../../../apps/api/src/features/content-ingestion/ingest-articles-on-schedule.service';
import { ManageApprovedSourcesService } from '../../../apps/api/src/features/content-ingestion/manage-approved-sources.service';
import { createStaticConnector } from '../../../apps/worker/src/features/content-ingestion/connectors';
import { ContentIngestionScheduler } from '../../../apps/worker/src/features/content-ingestion/scheduler';

describe('Content ingestion US2 unit: ingest articles on schedule', () => {
  it('runs a scheduled ingestion and returns stored article metadata', async () => {
    const repository = new InMemoryIngestionRepository();
    const sourceService = new ManageApprovedSourcesService(repository);
    sourceService.upsertSource({
      id: 'rss-world',
      name: 'World RSS',
      type: 'RSS',
      url: 'https://example.com/world/rss',
      enabled: true,
      createdAt: new Date('2026-05-27T08:00:00Z'),
    });

    const scheduler = new ContentIngestionScheduler({
      repository,
      connectors: [
        createStaticConnector('RSS', {
          'rss-world': [
            {
              title: 'World article',
              url: 'https://example.com/articles/world-article',
              publishedAt: new Date('2026-05-27T08:20:00Z'),
            },
          ],
        }),
      ],
    });

    const service = new IngestArticlesOnScheduleService(scheduler);
    const result = await service.run({ currentTime: new Date('2026-05-27T09:00:00Z') });

    expect(result.cadenceLabel).toContain('30-60');
    expect(result.run.successCount).toBe(1);
    expect(result.storedArticles).toHaveLength(1);
    expect(result.storedArticles[0].sourceId).toBe('rss-world');
  });
});