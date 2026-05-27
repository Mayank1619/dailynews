import { describe, expect, it } from 'vitest';
import { InMemoryIngestionRepository } from '../../../apps/api/src/features/content-ingestion/content-ingestion.types';
import { ContinueThroughPartialFailuresService } from '../../../apps/api/src/features/content-ingestion/continue-through-partial-failures.service';
import { ManageApprovedSourcesService } from '../../../apps/api/src/features/content-ingestion/manage-approved-sources.service';
import { createFailureConnector, createStaticConnector } from '../../../apps/worker/src/features/content-ingestion/connectors';
import { ContentIngestionScheduler } from '../../../apps/worker/src/features/content-ingestion/scheduler';

describe('Content ingestion US4 integration: partial failure contracts', () => {
  it('keeps healthy sources running when one provider fails', async () => {
    const repository = new InMemoryIngestionRepository();
    const sourceService = new ManageApprovedSourcesService(repository);

    sourceService.upsertSource({
      id: 'healthy-api',
      name: 'Healthy API',
      type: 'API',
      url: 'https://example.com/healthy/api',
      enabled: true,
      createdAt: new Date('2026-05-27T08:00:00Z'),
    });

    sourceService.upsertSource({
      id: 'broken-rss',
      name: 'Broken RSS',
      type: 'RSS',
      url: 'https://example.com/broken/rss',
      enabled: true,
      createdAt: new Date('2026-05-27T08:00:00Z'),
    });

    const scheduler = new ContentIngestionScheduler({
      repository,
      connectors: [
        createStaticConnector('API', {
          'healthy-api': [
            {
              title: 'Healthy API article',
              url: 'https://example.com/articles/healthy-api-article',
              publishedAt: new Date('2026-05-27T08:10:00Z'),
            },
          ],
        }),
        createFailureConnector('RSS', 'malformed_feed'),
      ],
    });

    const service = new ContinueThroughPartialFailuresService(scheduler);
    const result = await service.run(new Date('2026-05-27T09:00:00Z'));

    expect(result.run.sourceOutcomes).toHaveLength(2);
    expect(result.run.sourceOutcomes.find((outcome) => outcome.sourceId === 'healthy-api')?.status).toBe('success');
    expect(result.run.sourceOutcomes.find((outcome) => outcome.sourceId === 'broken-rss')?.status).toBe('failure');
    expect(result.summary.skippedSources).toBe(0);
  });
});