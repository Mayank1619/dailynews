import { describe, expect, it } from 'vitest';
import { InMemoryIngestionRepository } from '../../../apps/api/src/features/content-ingestion/content-ingestion.types';
import { ContinueThroughPartialFailuresService } from '../../../apps/api/src/features/content-ingestion/continue-through-partial-failures.service';
import { ManageApprovedSourcesService } from '../../../apps/api/src/features/content-ingestion/manage-approved-sources.service';
import { createFailureConnector, createStaticConnector } from '../../../apps/worker/src/features/content-ingestion/connectors';
import { ContentIngestionScheduler } from '../../../apps/worker/src/features/content-ingestion/scheduler';

describe('Content ingestion US4 unit: continue through partial failures', () => {
  it('completes ingestion when one enabled source fails', async () => {
    const repository = new InMemoryIngestionRepository();
    const sourceService = new ManageApprovedSourcesService(repository);

    sourceService.upsertSource({
      id: 'healthy-rss',
      name: 'Healthy RSS',
      type: 'RSS',
      url: 'https://example.com/healthy/rss',
      enabled: true,
      createdAt: new Date('2026-05-27T08:00:00Z'),
    });

    sourceService.upsertSource({
      id: 'failing-api',
      name: 'Failing API',
      type: 'API',
      url: 'https://example.com/failing/api',
      enabled: true,
      createdAt: new Date('2026-05-27T08:00:00Z'),
    });

    const scheduler = new ContentIngestionScheduler({
      repository,
      connectors: [
        createStaticConnector('RSS', {
          'healthy-rss': [
            {
              title: 'Healthy article',
              url: 'https://example.com/articles/healthy-article',
              publishedAt: new Date('2026-05-27T08:10:00Z'),
            },
          ],
        }),
        createFailureConnector('API', 'upstream_timeout'),
      ],
    });

    const service = new ContinueThroughPartialFailuresService(scheduler);
    const result = await service.run(new Date('2026-05-27T09:00:00Z'));

    expect(result.run.failureCount).toBe(1);
    expect(result.summary.healthySources).toBe(1);
    expect(result.summary.failedSources).toBe(1);
    expect(scheduler.listArticles()).toHaveLength(1);
  });
});