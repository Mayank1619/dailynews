import { IngestionRunRecord } from './content-ingestion.types';
import { PartialFailureEvent } from './continue-through-partial-failures.types';

export class ContinueThroughPartialFailuresTelemetry {
  private events: PartialFailureEvent[] = [];

  recordRun(run: IngestionRunRecord): void {
    for (const outcome of run.sourceOutcomes) {
      this.events.push({
        timestamp: new Date(),
        runId: run.id,
        sourceId: outcome.sourceId,
        outcome: outcome.status,
        reason: outcome.reason,
      });
    }
  }

  getEvents(): PartialFailureEvent[] {
    return this.events.map((event) => ({ ...event }));
  }

  summarize(): { totalEvents: number; failures: number; successes: number; skipped: number } {
    return {
      totalEvents: this.events.length,
      failures: this.events.filter((event) => event.outcome === 'failure').length,
      successes: this.events.filter((event) => event.outcome === 'success').length,
      skipped: this.events.filter((event) => event.outcome === 'skipped').length,
    };
  }
}