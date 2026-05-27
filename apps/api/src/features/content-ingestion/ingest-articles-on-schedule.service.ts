import { ContentIngestionScheduler } from '../../../../worker/src/features/content-ingestion/scheduler';
import { ArticleRawRecord } from './content-ingestion.types';
import { ScheduledIngestionRequest, ScheduledIngestionResult, ScheduledIngestionSnapshot } from './ingest-articles-on-schedule.types';
import { IngestArticlesOnScheduleTelemetry } from './ingest-articles-on-schedule.telemetry';

export class IngestArticlesOnScheduleService {
  constructor(
    private readonly scheduler: ContentIngestionScheduler,
    private readonly telemetry: IngestArticlesOnScheduleTelemetry = new IngestArticlesOnScheduleTelemetry(),
  ) {}

  async run(request: ScheduledIngestionRequest = {}): Promise<ScheduledIngestionResult> {
    const run = await this.scheduler.ingestSources(request.currentTime ?? new Date());
    this.telemetry.recordRun(run);

    return {
      run,
      storedArticles: this.scheduler.listArticles(),
      cadenceLabel: this.getCadenceLabel(),
    };
  }

  listStoredArticles(): ArticleRawRecord[] {
    return this.scheduler.listArticles();
  }

  summarize(): ScheduledIngestionSnapshot {
    const runHistory = this.scheduler.listRuns();

    return {
      totalRuns: runHistory.length,
      totalStoredArticles: this.scheduler.listArticles().length,
      totalDuplicatesSkipped: runHistory.reduce((total, run) => total + run.skippedDuplicates, 0),
      totalFailures: runHistory.reduce((total, run) => total + run.failureCount, 0),
      lastRunId: runHistory.at(-1)?.id,
    };
  }

  getCadenceLabel(): string {
    return 'Every 30-60 minutes';
  }

  getTelemetry(): IngestArticlesOnScheduleTelemetry {
    return this.telemetry;
  }
}