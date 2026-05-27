import { ContentIngestionScheduler } from '../../../../worker/src/features/content-ingestion/scheduler';
import { PartialFailureResult, PartialFailureSummary } from './continue-through-partial-failures.types';
import { ContinueThroughPartialFailuresTelemetry } from './continue-through-partial-failures.telemetry';

export class ContinueThroughPartialFailuresService {
  constructor(
    private readonly scheduler: ContentIngestionScheduler,
    private readonly telemetry: ContinueThroughPartialFailuresTelemetry = new ContinueThroughPartialFailuresTelemetry(),
  ) {}

  async run(now: Date = new Date()): Promise<PartialFailureResult> {
    const run = await this.scheduler.ingestSources(now);
    this.telemetry.recordRun(run);

    return {
      run,
      summary: this.summarize(run.id),
    };
  }

  summarize(runId: string): PartialFailureSummary {
    const run = this.scheduler.listRuns().find((item) => item.id === runId);

    if (!run) {
      return {
        runId,
        totalSources: 0,
        healthySources: 0,
        failedSources: 0,
        skippedSources: 0,
        storedArticles: 0,
        duplicateArticles: 0,
      };
    }

    const healthySources = run.sourceOutcomes.filter((outcome) => outcome.status === 'success').length;
    const failedSources = run.sourceOutcomes.filter((outcome) => outcome.status === 'failure').length;
    const skippedSources = run.sourceOutcomes.filter((outcome) => outcome.status === 'skipped').length;

    return {
      runId: run.id,
      totalSources: run.sourceOutcomes.length,
      healthySources,
      failedSources,
      skippedSources,
      storedArticles: run.successCount,
      duplicateArticles: run.skippedDuplicates,
    };
  }

  getTelemetry(): ContinueThroughPartialFailuresTelemetry {
    return this.telemetry;
  }
}