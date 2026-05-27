import {
  ArticleRawRecord,
  buildArticleRawRecord,
  ContentSourceRecord,
  DEFAULT_INGESTION_INTERVAL_MINUTES,
  InMemoryIngestionRepository,
  IngestionConnector,
  IngestionRepository,
  IngestionRunRecord,
  SourceOutcome,
  isSourceEligibleForFetch,
} from '../../../../api/src/features/content-ingestion/content-ingestion.types';
import { createConnectorRegistry, getConnectorForSource, IngestionConnectorRegistry } from './connectors';

export interface IngestionSchedulerOptions {
  repository?: IngestionRepository;
  connectors?: IngestionConnector[];
  minimumIntervalMinutes?: number;
}

export class ContentIngestionScheduler {
  private readonly repository: IngestionRepository;
  private readonly connectors: IngestionConnectorRegistry;
  private readonly minimumIntervalMinutes: number;

  constructor(options: IngestionSchedulerOptions = {}) {
    this.repository = options.repository ?? new InMemoryIngestionRepository();
    this.connectors = createConnectorRegistry(options.connectors ?? []);
    this.minimumIntervalMinutes = options.minimumIntervalMinutes ?? DEFAULT_INGESTION_INTERVAL_MINUTES;
  }

  registerConnector(connector: IngestionConnector): void {
    this.connectors.set(connector.sourceType, connector);
  }

  registerConnectors(connectors: IngestionConnector[]): void {
    for (const connector of connectors) {
      this.registerConnector(connector);
    }
  }

  getSources(): ContentSourceRecord[] {
    return this.repository.listSources();
  }

  listArticles(): ArticleRawRecord[] {
    return this.repository.listArticles();
  }

  listRuns(): IngestionRunRecord[] {
    return this.repository.listRuns();
  }

  async ingestSources(now: Date = new Date()): Promise<IngestionRunRecord> {
    const startedAt = now;
    const sourceOutcomes: SourceOutcome[] = [];
    let successCount = 0;
    let failureCount = 0;
    let skippedDuplicates = 0;

    for (const source of this.repository.listSources()) {
      const currentSource = this.repository.getSource(source.id) ?? source;

      if (!currentSource.enabled) {
        sourceOutcomes.push({
          sourceId: currentSource.id,
          sourceName: currentSource.name,
          sourceType: currentSource.type,
          status: 'skipped',
          storedCount: 0,
          duplicateCount: 0,
          fetchedCount: 0,
          reason: 'source_disabled',
          finishedAt: new Date(),
        });
        continue;
      }

      if (!isSourceEligibleForFetch(currentSource, now, this.minimumIntervalMinutes)) {
        sourceOutcomes.push({
          sourceId: currentSource.id,
          sourceName: currentSource.name,
          sourceType: currentSource.type,
          status: 'skipped',
          storedCount: 0,
          duplicateCount: 0,
          fetchedCount: 0,
          reason: 'rate_limited',
          finishedAt: new Date(),
        });
        continue;
      }

      const connector = getConnectorForSource(currentSource, this.connectors);
      if (!connector) {
        failureCount += 1;
        sourceOutcomes.push({
          sourceId: currentSource.id,
          sourceName: currentSource.name,
          sourceType: currentSource.type,
          status: 'failure',
          storedCount: 0,
          duplicateCount: 0,
          fetchedCount: 0,
          reason: 'missing_connector',
          finishedAt: new Date(),
        });
        continue;
      }

      try {
        const result = await connector.fetch(currentSource);
        const fetchedAt = result.fetchedAt ?? new Date();
        let storedCount = 0;
        let duplicateCount = 0;

        for (const item of result.items) {
          const article = buildArticleRawRecord(currentSource.id, item, fetchedAt);
          if (this.repository.hasArticleByCanonicalIdentity(article.url, article.rawHash)) {
            duplicateCount += 1;
            skippedDuplicates += 1;
            continue;
          }

          this.repository.saveArticle(article);
          storedCount += 1;
          successCount += 1;
        }

        this.repository.upsertSource({
          ...currentSource,
          lastFetchedAt: fetchedAt,
        });

        sourceOutcomes.push({
          sourceId: currentSource.id,
          sourceName: currentSource.name,
          sourceType: currentSource.type,
          status: 'success',
          storedCount,
          duplicateCount,
          fetchedCount: result.items.length,
          finishedAt: new Date(),
          lastSuccessfulFetchAt: fetchedAt,
        });
      } catch (error) {
        failureCount += 1;
        sourceOutcomes.push({
          sourceId: currentSource.id,
          sourceName: currentSource.name,
          sourceType: currentSource.type,
          status: 'failure',
          storedCount: 0,
          duplicateCount: 0,
          fetchedCount: 0,
          reason: error instanceof Error ? error.message : 'fetch_failed',
          finishedAt: new Date(),
        });
      }
    }

    const run: IngestionRunRecord = {
      id: `ingestion_${startedAt.getTime()}`,
      startedAt,
      finishedAt: new Date(),
      successCount,
      failureCount,
      skippedDuplicates,
      sourceOutcomes,
    };

    this.repository.saveRun(run);
    return run;
  }
}

export async function ingestSources(options: {
  repository?: IngestionRepository;
  connectors?: IngestionConnector[];
  minimumIntervalMinutes?: number;
  now?: Date;
} = {}): Promise<IngestionRunRecord> {
  const scheduler = new ContentIngestionScheduler(options);
  return scheduler.ingestSources(options.now);
}