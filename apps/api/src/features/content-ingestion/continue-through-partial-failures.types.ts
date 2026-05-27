import type { IngestionRunRecord, SourceOutcome } from './content-ingestion.types';

export interface PartialFailureSummary {
  runId: string;
  totalSources: number;
  healthySources: number;
  failedSources: number;
  skippedSources: number;
  storedArticles: number;
  duplicateArticles: number;
}

export interface PartialFailureEvent {
  timestamp: Date;
  runId: string;
  sourceId: string;
  outcome: SourceOutcome['status'];
  reason?: string;
}

export interface PartialFailureResult {
  run: IngestionRunRecord;
  summary: PartialFailureSummary;
}