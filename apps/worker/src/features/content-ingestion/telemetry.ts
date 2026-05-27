import { IngestionRunRecord, SourceOutcome } from '../../../../api/src/features/content-ingestion/content-ingestion.types';

export interface IngestionAuditEvent {
  timestamp: Date;
  runId: string;
  event: 'run_started' | 'run_completed' | 'source_success' | 'source_failure' | 'source_skipped';
  context: Record<string, unknown>;
}

export class IngestionTelemetryService {
  private readonly runs = new Map<string, IngestionRunRecord>();
  private readonly events: IngestionAuditEvent[] = [];

  recordRunStarted(runId: string, startedAt: Date = new Date()): void {
    this.events.push({
      timestamp: startedAt,
      runId,
      event: 'run_started',
      context: {},
    });
  }

  recordRunCompleted(run: IngestionRunRecord): void {
    this.runs.set(run.id, run);
    this.events.push({
      timestamp: run.finishedAt,
      runId: run.id,
      event: 'run_completed',
      context: {
        successCount: run.successCount,
        failureCount: run.failureCount,
        skippedDuplicates: run.skippedDuplicates,
      },
    });
  }

  recordSourceOutcome(runId: string, outcome: SourceOutcome): void {
    this.events.push({
      timestamp: outcome.finishedAt,
      runId,
      event: outcome.status === 'success' ? 'source_success' : outcome.status === 'failure' ? 'source_failure' : 'source_skipped',
      context: {
        sourceId: outcome.sourceId,
        sourceType: outcome.sourceType,
        status: outcome.status,
        reason: outcome.reason,
        storedCount: outcome.storedCount,
        duplicateCount: outcome.duplicateCount,
        fetchedCount: outcome.fetchedCount,
      },
    });
  }

  getRun(runId: string): IngestionRunRecord | undefined {
    const run = this.runs.get(runId);
    return run ? { ...run, sourceOutcomes: run.sourceOutcomes.map((outcome) => ({ ...outcome })) } : undefined;
  }

  getEvents(runId?: string): IngestionAuditEvent[] {
    return this.events
      .filter((event) => (runId ? event.runId === runId : true))
      .map((event) => ({ ...event, context: { ...event.context } }));
  }

  summarize(runId?: string): { totalRuns: number; totalSuccesses: number; totalFailures: number; totalDuplicates: number } {
    const runs = runId ? [...this.runs.values()].filter((run) => run.id === runId) : [...this.runs.values()];

    return {
      totalRuns: runs.length,
      totalSuccesses: runs.reduce((total, run) => total + run.successCount, 0),
      totalFailures: runs.reduce((total, run) => total + run.failureCount, 0),
      totalDuplicates: runs.reduce((total, run) => total + run.skippedDuplicates, 0),
    };
  }
}