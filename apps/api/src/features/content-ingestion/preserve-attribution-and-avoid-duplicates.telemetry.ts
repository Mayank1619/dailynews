export interface AttributionTelemetryEvent {
  timestamp: Date;
  sourceId: string;
  event: 'stored' | 'duplicate_skipped';
  details: Record<string, unknown>;
}

export class PreserveAttributionAndAvoidDuplicatesTelemetry {
  private events: AttributionTelemetryEvent[] = [];

  record(event: Omit<AttributionTelemetryEvent, 'timestamp'>): void {
    this.events.push({ ...event, timestamp: new Date() });
  }

  getEvents(): AttributionTelemetryEvent[] {
    return this.events.map((event) => ({ ...event, details: { ...event.details } }));
  }

  summarize(): { totalEvents: number; stored: number; duplicatesSkipped: number } {
    return {
      totalEvents: this.events.length,
      stored: this.events.filter((event) => event.event === 'stored').length,
      duplicatesSkipped: this.events.filter((event) => event.event === 'duplicate_skipped').length,
    };
  }
}