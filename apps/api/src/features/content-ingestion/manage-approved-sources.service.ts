import {
  ContentSourceRecord,
  DEFAULT_INGESTION_INTERVAL_MINUTES,
  InMemoryIngestionRepository,
  IngestionRepository,
  isSourceEligibleForFetch,
} from './content-ingestion.types';
import { ManagedSourceInput, ManageApprovedSourcesResult, SourceGovernanceSnapshot } from './manage-approved-sources.types';
import { ManageApprovedSourcesTelemetry } from './manage-approved-sources.telemetry';

export class ManageApprovedSourcesService {
  constructor(
    private readonly repository: IngestionRepository = new InMemoryIngestionRepository(),
    private readonly telemetry: ManageApprovedSourcesTelemetry = new ManageApprovedSourcesTelemetry(),
  ) {}

  getRepository(): IngestionRepository {
    return this.repository;
  }

  getTelemetry(): ManageApprovedSourcesTelemetry {
    return this.telemetry;
  }

  upsertSource(input: ManagedSourceInput): ManageApprovedSourcesResult {
    this.assertValidSource(input);

    const existing = this.repository.getSource(input.id);
    const source: ContentSourceRecord = {
      id: input.id,
      name: input.name.trim(),
      type: input.type,
      url: input.url.trim(),
      enabled: input.enabled,
      categoryHint: input.categoryHint?.trim() || undefined,
      createdAt: existing?.createdAt ?? input.createdAt ?? new Date(),
      lastFetchedAt: input.lastFetchedAt ?? existing?.lastFetchedAt,
    };

    const saved = this.repository.upsertSource(source);

    this.telemetry.record({
      sourceId: saved.id,
      sourceName: saved.name,
      sourceType: saved.type,
      action: existing ? 'updated' : 'created',
      enabled: saved.enabled,
      details: {
        categoryHint: saved.categoryHint ?? null,
      },
    });

    return {
      source: saved,
      created: !existing,
    };
  }

  setSourceEnabled(sourceId: string, enabled: boolean): ContentSourceRecord | undefined {
    const source = this.repository.getSource(sourceId);
    if (!source) {
      return undefined;
    }

    const updated = this.repository.upsertSource({
      ...source,
      enabled,
    });

    this.telemetry.record({
      sourceId: updated.id,
      sourceName: updated.name,
      sourceType: updated.type,
      action: enabled ? 'enabled' : 'disabled',
      enabled: updated.enabled,
      details: {
        categoryHint: updated.categoryHint ?? null,
      },
    });

    return updated;
  }

  recordSuccessfulFetch(sourceId: string, fetchedAt: Date = new Date()): ContentSourceRecord | undefined {
    const source = this.repository.getSource(sourceId);
    if (!source) {
      return undefined;
    }

    const updated = this.repository.upsertSource({
      ...source,
      lastFetchedAt: fetchedAt,
    });

    this.telemetry.record({
      sourceId: updated.id,
      sourceName: updated.name,
      sourceType: updated.type,
      action: 'fetched',
      enabled: updated.enabled,
      details: {
        lastFetchedAt: fetchedAt.toISOString(),
      },
    });

    return updated;
  }

  listSources(): ContentSourceRecord[] {
    return this.repository.listSources().sort((left, right) => left.name.localeCompare(right.name));
  }

  listEnabledSources(now: Date = new Date()): ContentSourceRecord[] {
    return this.listSources().filter((source) => source.enabled);
  }

  listEligibleSources(
    now: Date = new Date(),
    minimumIntervalMinutes: number = DEFAULT_INGESTION_INTERVAL_MINUTES,
  ): ContentSourceRecord[] {
    return this.listSources().filter((source) => isSourceEligibleForFetch(source, now, minimumIntervalMinutes));
  }

  summarizeSources(now: Date = new Date()): SourceGovernanceSnapshot {
    const sources = this.listSources();
    const enabledSources = sources.filter((source) => source.enabled).length;
    const rssSources = sources.filter((source) => source.type === 'RSS').length;
    const apiSources = sources.filter((source) => source.type === 'API').length;
    const eligibleSources = sources.filter((source) => isSourceEligibleForFetch(source, now)).length;

    return {
      totalSources: sources.length,
      enabledSources,
      disabledSources: sources.length - enabledSources,
      rssSources,
      apiSources,
      eligibleSources,
    };
  }

  private assertValidSource(input: ManagedSourceInput): void {
    if (!input.id || !input.id.trim()) {
      throw new Error('source_id_required');
    }

    if (!input.name || !input.name.trim()) {
      throw new Error('source_name_required');
    }

    if (input.type !== 'RSS' && input.type !== 'API') {
      throw new Error('source_type_invalid');
    }

    try {
      new URL(input.url);
    } catch {
      throw new Error('source_url_invalid');
    }
  }
}