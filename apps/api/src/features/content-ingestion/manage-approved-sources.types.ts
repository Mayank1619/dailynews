import type { ContentSourceRecord, ContentSourceType } from './content-ingestion.types';

export interface ManagedSourceInput extends Omit<ContentSourceRecord, 'createdAt'> {
  createdAt?: Date;
}

export interface SourceGovernanceSnapshot {
  totalSources: number;
  enabledSources: number;
  disabledSources: number;
  rssSources: number;
  apiSources: number;
  eligibleSources: number;
}

export interface SourceGovernanceEvent {
  sourceId: string;
  sourceName: string;
  sourceType: ContentSourceType;
  action: 'created' | 'updated' | 'enabled' | 'disabled' | 'fetched';
  enabled: boolean;
  timestamp: Date;
  details?: Record<string, unknown>;
}

export interface ManageApprovedSourcesResult {
  source: ContentSourceRecord;
  created: boolean;
}