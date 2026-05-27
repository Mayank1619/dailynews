import type { ArticleProcessed } from "./contracts";
import type { IdempotentAndPipelineVersionTrackedProcessingInput, IdempotentAndPipelineVersionTrackedProcessingResult } from "./idempotent-and-pipeline-version-tracked-processing.types";
import { DeduplicateStoriesAcrossSourcesService } from "./deduplicate-stories-across-sources.service";
import { AssignTaxonomyCategoriesToStoriesService } from "./assign-taxonomy-categories-to-stories.service";
import { IdempotentAndPipelineVersionTrackedProcessingTelemetry } from "./idempotent-and-pipeline-version-tracked-processing.telemetry";

export class IdempotentAndPipelineVersionTrackedProcessingService {
  constructor(
    private readonly deduplicator = new DeduplicateStoriesAcrossSourcesService(),
    private readonly categorizer = new AssignTaxonomyCategoriesToStoriesService(),
    private readonly telemetry = new IdempotentAndPipelineVersionTrackedProcessingTelemetry()
  ) {}

  process(input: IdempotentAndPipelineVersionTrackedProcessingInput): IdempotentAndPipelineVersionTrackedProcessingResult {
    const deduped = this.deduplicator.deduplicate({
      rawArticles: input.rawArticles,
      existingProcessed: input.existingProcessed,
      pipelineVersion: input.pipelineVersion
    });

    const categorized = this.categorizer.assignCategories({
      articles: deduped.processedArticles,
      pipelineVersion: input.pipelineVersion
    });

    const processedArticles: ArticleProcessed[] = categorized.articles.map(({ needsReview, ...article }) => article);

    this.telemetry.recordRawArticlesIngested(input.rawArticles.length);
    this.telemetry.recordNormalizedArticles(processedArticles.length);
    this.telemetry.recordDedupGroupsCreated(deduped.dedupGroups.length);
    this.telemetry.recordUpdatedArticlesStored(deduped.run.updatedCount);
    this.telemetry.recordNewArticlesStored(deduped.run.newCount);

    return {
      processedArticles,
      run: {
        ...deduped.run,
        updatedCount: input.existingProcessed?.length ? deduped.run.updatedCount : 0
      }
    };
  }
}
