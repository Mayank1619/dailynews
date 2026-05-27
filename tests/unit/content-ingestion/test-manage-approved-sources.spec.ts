import { describe, expect, it } from 'vitest';
import { InMemoryIngestionRepository } from '../../../apps/api/src/features/content-ingestion/content-ingestion.types';
import { ManageApprovedSourcesService } from '../../../apps/api/src/features/content-ingestion/manage-approved-sources.service';

describe('Content ingestion US1 unit: manage approved sources', () => {
  it('creates, updates, and toggles source eligibility', () => {
    const repository = new InMemoryIngestionRepository();
    const service = new ManageApprovedSourcesService(repository);

    const created = service.upsertSource({
      id: 'source-1',
      name: 'Trusted RSS',
      type: 'RSS',
      url: 'https://example.com/rss?utm_source=tracking',
      enabled: true,
      categoryHint: 'world',
      createdAt: new Date('2026-05-27T08:00:00Z'),
    });

    expect(created.created).toBe(true);
    expect(created.source.enabled).toBe(true);
    expect(service.listEnabledSources().map((source) => source.id)).toEqual(['source-1']);

    const updated = service.setSourceEnabled('source-1', false);
    expect(updated?.enabled).toBe(false);
    expect(service.listEligibleSources(new Date('2026-05-27T09:00:00Z'))).toHaveLength(0);

    const summary = service.summarizeSources();
    expect(summary.totalSources).toBe(1);
    expect(summary.disabledSources).toBe(1);
  });
});