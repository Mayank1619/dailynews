import type { ArticleRawRecord, IngestionRunRecord } from './content-ingestion.types';

export interface ScheduledIngestionRequest {
  requestedBy?: 'scheduler' | 'manual';
  currentTime?: Date;
}

export interface ScheduledIngestionResult {
  run: IngestionRunRecord;
  storedArticles: ArticleRawRecord[];
  cadenceLabel: string;
}

export interface ScheduledIngestionSnapshot {
  totalRuns: number;
  totalStoredArticles: number;
  totalDuplicatesSkipped: number;
  totalFailures: number;
  lastRunId?: string;
}