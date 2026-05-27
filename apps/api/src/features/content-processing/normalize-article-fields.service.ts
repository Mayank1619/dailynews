import type { ArticleProcessed } from "./contracts";
import {
  buildDedupGroupId,
  buildSources,
  chooseEarliestPublishedAt,
  chooseRepresentativeSnippet,
  chooseRepresentativeTitle,
  resolveCanonicalUrl,
  CONTENT_PROCESSING_PIPELINE_VERSION,
  assignTaxonomyCategories
} from "./versioning";
import type { NormalizeArticleFieldsInput, NormalizeArticleFieldsResult } from "./normalize-article-fields.types";
import { NormalizeArticleFieldsTelemetry } from "./normalize-article-fields.telemetry";

export class NormalizeArticleFieldsService {
  constructor(private readonly telemetry = new NormalizeArticleFieldsTelemetry()) {}

  normalize(input: NormalizeArticleFieldsInput): NormalizeArticleFieldsResult {
    const pipelineVersion = input.pipelineVersion ?? CONTENT_PROCESSING_PIPELINE_VERSION;
    const skippedRawArticleIds: string[] = [];
    const normalizedArticles: ArticleProcessed[] = [];

    this.telemetry.recordRawArticlesIngested(input.rawArticles.length);

    for (const rawArticle of input.rawArticles) {
      if (!rawArticle.id || (!rawArticle.url && !rawArticle.rawHash && !rawArticle.title)) {
        skippedRawArticleIds.push(rawArticle.id || "unknown");
        this.telemetry.recordFailure({ rawArticleId: rawArticle.id || "unknown", stage: "normalize", reason: "unprocessable_raw_article" });
        continue;
      }

      const canonicalUrl = resolveCanonicalUrl([rawArticle]);
      const dedupGroupId = buildDedupGroupId([rawArticle], canonicalUrl);
      const title = chooseRepresentativeTitle([rawArticle]);
      const snippet = chooseRepresentativeSnippet([rawArticle]);
      const publishedAt = chooseEarliestPublishedAt([rawArticle]);

      normalizedArticles.push({
        id: dedupGroupId,
        dedupGroupId,
        canonicalUrl,
        title,
        snippet,
        publishedAt,
        categories: assignTaxonomyCategories(`${title} ${snippet}`),
        sources: buildSources([rawArticle]),
        processingTimestamp: new Date().toISOString(),
        pipelineVersion
      });
    }

    this.telemetry.recordNormalizedArticles(normalizedArticles.length);

    return {
      normalizedArticles,
      skippedRawArticleIds,
      run: {
        id: `run_${Date.now()}`,
        batchSize: input.rawArticles.length,
        newCount: normalizedArticles.length,
        updatedCount: 0,
        failureCount: skippedRawArticleIds.length,
        pipelineVersion,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString()
      }
    };
  }
}
