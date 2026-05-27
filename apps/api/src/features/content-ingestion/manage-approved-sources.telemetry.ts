import { SourceGovernanceEvent, SourceGovernanceSnapshot } from './manage-approved-sources.types';

export class ManageApprovedSourcesTelemetry {
  private events: SourceGovernanceEvent[] = [];

  record(event: Omit<SourceGovernanceEvent, 'timestamp'>): void {
    this.events.push({ ...event, timestamp: new Date() });
  }

  getEvents(): SourceGovernanceEvent[] {
    return this.events.map((event) => ({ ...event, details: event.details ? { ...event.details } : undefined }));
  }

  summarize(): SourceGovernanceSnapshot {
    const totalSources = new Set(this.events.map((event) => event.sourceId)).size;
    const enabledSources = this.events.filter((event) => event.enabled).length;
    const disabledSources = this.events.filter((event) => !event.enabled).length;
    const rssSources = this.events.filter((event) => event.sourceType === 'RSS').length;
    const apiSources = this.events.filter((event) => event.sourceType === 'API').length;

    return {
      totalSources,
      enabledSources,
      disabledSources,
      rssSources,
      apiSources,
      eligibleSources: this.events.filter((event) => event.enabled && event.action !== 'disabled').length,
    };
  }
}