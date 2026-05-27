import {
  ContentSourceRecord,
  ContentSourceType,
  IngestionConnector,
  IngestionConnectorResult,
  RawArticleInput,
} from '../../../../api/src/features/content-ingestion/content-ingestion.types';

export type IngestionConnectorRegistry = Map<ContentSourceType, IngestionConnector>;

export function createConnectorRegistry(connectors: IngestionConnector[]): IngestionConnectorRegistry {
  const registry: IngestionConnectorRegistry = new Map();

  for (const connector of connectors) {
    registry.set(connector.sourceType, connector);
  }

  return registry;
}

export function createStaticConnector(
  sourceType: ContentSourceType,
  fixtures: Record<string, RawArticleInput[]>,
  fetchedAt: Date = new Date('2026-05-27T00:00:00Z'),
): IngestionConnector {
  return {
    sourceType,
    fetch(source: ContentSourceRecord): IngestionConnectorResult {
      return {
        fetchedAt,
        items: fixtures[source.id]?.map((item) => ({ ...item })) ?? [],
        sourceFingerprint: `${source.id}:${sourceType}`,
      };
    },
  };
}

export function createFailureConnector(sourceType: ContentSourceType, message: string): IngestionConnector {
  return {
    sourceType,
    async fetch(): Promise<IngestionConnectorResult> {
      throw new Error(message);
    },
  };
}

export function getConnectorForSource(source: ContentSourceRecord, registry: IngestionConnectorRegistry): IngestionConnector | undefined {
  return registry.get(source.type);
}