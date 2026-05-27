import { IngestionRunRecord } from './content-ingestion.types';

export interface ScheduledIngestionTelemetrySnapshot {
  runId: string;
  successCount: number;
  failureCount: number;
  skippedDuplicates: number;
  sourceCount: number;
  lastRecordedAt: Date;
}

export class IngestArticlesOnScheduleTelemetry {
  private runs = new Map<string, ScheduledIngestionTelemetrySnapshot>();

  recordRun(run: IngestionRunRecord): void {
    this.runs.set(run.id, {
      runId: run.id,
      successCount: run.successCount,
      failureCount: run.failureCount,
      skippedDuplicates: run.skippedDuplicates,
      sourceCount: run.sourceOutcomes.length,
      lastRecordedAt: new Date(),
    });
  }

  getRun(runId: string): ScheduledIngestionTelemetrySnapshot | undefined {
    const run = this.runs.get(runId);
    return run ? { ...run } : undefined;
  }

  summarize(): { totalRuns: number; totalSuccesses: number; totalFailures: number; totalDuplicates: number } {
    const snapshots = [...this.runs.values()];

    return {
      totalRuns: snapshots.length,
      totalSuccesses: snapshots.reduce((total, run) => total + run.successCount, 0),
      totalFailures: snapshots.reduce((total, run) => total + run.failureCount, 0),
      totalDuplicates: snapshots.reduce((total, run) => total + run.skippedDuplicates, 0),
    };
  }
}