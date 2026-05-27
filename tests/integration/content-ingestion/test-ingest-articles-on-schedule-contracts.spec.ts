import { describe, expect, it } from 'vitest';
import { InMemoryIngestionRepository } from '../../../apps/api/src/features/content-ingestion/content-ingestion.types';
import { IngestArticlesOnScheduleService } from '../../../apps/api/src/features/content-ingestion/ingest-articles-on-schedule.service';
import { ManageApprovedSourcesService } from '../../../apps/api/src/features/content-ingestion/manage-approved-sources.service';
import { createStaticConnector } from '../../../apps/worker/src/features/content-ingestion/connectors';
import { ContentIngestionScheduler } from '../../../apps/worker/src/features/content-ingestion/scheduler';

describe('Content ingestion US2 integration: scheduled ingestion contracts', () => {
  it('does not duplicate articles when the same feed is processed again', async () => {
    const repository = new InMemoryIngestionRepository();
    const sourceService = new ManageApprovedSourcesService(repository);

    sourceService.upsertSource({
      id: 'rss-schedule',
      name: 'Scheduled RSS',
      type: 'RSS',
      url: 'https://example.com/scheduled/rss',
      enabled: true,
      createdAt: new Date('2026-05-27T08:00:00Z'),
    });

    const scheduler = new ContentIngestionScheduler({
      repository,
      connectors: [
        createStaticConnector('RSS', {
          'rss-schedule': [
            {
              title: 'Scheduled article',
              url: 'https://example.com/articles/scheduled-article?utm_source=rss',
              publishedAt: new Date('2026-05-27T08:25:00Z'),
            },
          ],
        }),
      ],
    });

    const service = new IngestArticlesOnScheduleService(scheduler);

    const firstRun = await service.run({ currentTime: new Date('2026-05-27T09:00:00Z') });
    const secondRun = await service.run({ currentTime: new Date('2026-05-27T10:00:00Z') });

    expect(firstRun.run.successCount).toBe(1);
    expect(secondRun.run.successCount).toBe(0);
    expect(secondRun.run.skippedDuplicates).toBe(1);
    expect(service.listStoredArticles()).toHaveLength(1);
  });
});