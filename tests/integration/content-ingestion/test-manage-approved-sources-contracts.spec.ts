import { describe, expect, it } from 'vitest';
import { createStaticConnector } from '../../../apps/worker/src/features/content-ingestion/connectors';
import { ContentIngestionScheduler } from '../../../apps/worker/src/features/content-ingestion/scheduler';
import { InMemoryIngestionRepository } from '../../../apps/api/src/features/content-ingestion/content-ingestion.types';
import { ManageApprovedSourcesService } from '../../../apps/api/src/features/content-ingestion/manage-approved-sources.service';

describe('Content ingestion US1 integration: approved source contracts', () => {
  it('ingests enabled sources and skips disabled sources', async () => {
    const repository = new InMemoryIngestionRepository();
    const sources = new ManageApprovedSourcesService(repository);

    sources.upsertSource({
      id: 'enabled-rss',
      name: 'Enabled RSS',
      type: 'RSS',
      url: 'https://example.com/enabled/rss',
      enabled: true,
      createdAt: new Date('2026-05-27T08:00:00Z'),
    });

    sources.upsertSource({
      id: 'disabled-api',
      name: 'Disabled API',
      type: 'API',
      url: 'https://example.com/disabled/api',
      enabled: false,
      createdAt: new Date('2026-05-27T08:00:00Z'),
    });

    const scheduler = new ContentIngestionScheduler({
      repository,
      connectors: [
        createStaticConnector('RSS', {
          'enabled-rss': [
            {
              title: 'Enabled source article',
              url: 'https://example.com/articles/enabled-source-article',
              publishedAt: new Date('2026-05-27T08:15:00Z'),
            },
          ],
        }),
      ],
    });

    const run = await scheduler.ingestSources(new Date('2026-05-27T09:00:00Z'));

    expect(run.successCount).toBe(1);
    expect(run.failureCount).toBe(0);
    expect(run.sourceOutcomes).toHaveLength(2);
    expect(run.sourceOutcomes.find((outcome) => outcome.sourceId === 'enabled-rss')?.status).toBe('success');
    expect(run.sourceOutcomes.find((outcome) => outcome.sourceId === 'disabled-api')?.status).toBe('skipped');
  });
});