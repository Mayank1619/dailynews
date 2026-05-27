import type { ArticleProcessed, ArticleRaw, DedupGroup } from "./contracts";
import {
  buildDedupGroupId,
  buildSources,
  chooseEarliestPublishedAt,
  chooseRepresentativeSnippet,
  chooseRepresentativeTitle,
  canonicalizeUrl,
  CONTENT_PROCESSING_PIPELINE_VERSION,
  resolveCanonicalUrl,
  sameStoryByUrlOrSimilarity,
  stableArticleSort,
  assignTaxonomyCategories
} from "./versioning";
import type { DeduplicateStoriesAcrossSourcesInput, DeduplicateStoriesAcrossSourcesResult, DeduplicationDecision } from "./deduplicate-stories-across-sources.types";
import { DeduplicateStoriesTelemetry } from "./deduplicate-stories-across-sources.telemetry";

type WorkingGroup = {
  rawArticles: ArticleRaw[];
  decision: DeduplicationDecision;
};

export class DeduplicateStoriesAcrossSourcesService {
  constructor(private readonly telemetry = new DeduplicateStoriesTelemetry()) {}

  deduplicate(input: DeduplicateStoriesAcrossSourcesInput): DeduplicateStoriesAcrossSourcesResult {
    const pipelineVersion = input.pipelineVersion ?? CONTENT_PROCESSING_PIPELINE_VERSION;
    const sortedRaw = [...input.rawArticles].sort(stableArticleSort);
    const workingGroups: WorkingGroup[] = [];
    const dedupGroups: DedupGroup[] = [];

    this.telemetry.recordRawArticlesIngested(sortedRaw.length);

    for (const rawArticle of sortedRaw) {
      if (!rawArticle.id || !rawArticle.sourceId) {
        this.telemetry.recordFailure({ rawArticleId: rawArticle.id || "unknown", stage: "deduplicate", reason: "missing_identifier" });
        continue;
      }

      if (!normalizeable(rawArticle)) {
        this.telemetry.recordFailure({ rawArticleId: rawArticle.id, stage: "deduplicate", reason: "unprocessable_raw_article" });
        continue;
      }

      const canonicalUrl = canonicalizeUrl(rawArticle.url);
      let matchedGroup = workingGroups.find((group) => {
        const candidate = group.rawArticles[0];
        const candidateCanonical = canonicalizeUrl(candidate.url);

        if (canonicalUrl && candidateCanonical && canonicalUrl === candidateCanonical) {
          return true;
        }

        if (rawArticle.rawHash && candidate.rawHash && rawArticle.rawHash === candidate.rawHash) {
          return true;
        }

        return sameStoryByUrlOrSimilarity(candidate, rawArticle);
      });

      if (!matchedGroup) {
        matchedGroup = {
          rawArticles: [rawArticle],
          decision: {
            rawArticleId: rawArticle.id,
            dedupGroupId: buildDedupGroupId([rawArticle], resolveCanonicalUrl([rawArticle])),
            matchReason: "single-source"
          }
        };

        workingGroups.push(matchedGroup);
        this.telemetry.recordDedupGroupsCreated();
        continue;
      }

      matchedGroup.rawArticles.push(rawArticle);
      this.telemetry.recordMergedIntoExistingGroups();
    }

    const processedArticles = workingGroups.map(({ rawArticles }) => {
      const canonicalUrl = resolveCanonicalUrl(rawArticles);
      const dedupGroupId = buildDedupGroupId(rawArticles, canonicalUrl);

      dedupGroups.push({
        dedupGroupId,
        canonicalUrl,
        memberRawIds: rawArticles.map((article) => article.id)
      });

      return this.buildProcessedArticle(rawArticles, dedupGroupId, canonicalUrl, pipelineVersion);
    });

    const run = {
      id: `run_${Date.now()}`,
      batchSize: sortedRaw.length,
      newCount: processedArticles.length,
      updatedCount: 0,
      failureCount: this.telemetry.getSnapshot().failures,
      pipelineVersion,
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString()
    };

    return {
      processedArticles: reconcileExistingProcessed(processedArticles, input.existingProcessed ?? []),
      dedupGroups,
      run
    };
  }

  private buildProcessedArticle(rawArticles: ArticleRaw[], dedupGroupId: string, canonicalUrl: string, pipelineVersion: string): ArticleProcessed {
    const title = chooseRepresentativeTitle(rawArticles);
    const snippet = chooseRepresentativeSnippet(rawArticles);
    const publishedAt = chooseEarliestPublishedAt(rawArticles);
    const categories = assignTaxonomyCategories(`${title} ${snippet}`);
    const sources = buildSources(rawArticles);
    const processingTimestamp = new Date().toISOString();

    return {
      id: dedupGroupId,
      dedupGroupId,
      canonicalUrl,
      title,
      snippet,
      publishedAt,
      categories,
      sources,
      processingTimestamp,
      pipelineVersion
    };
  }
}

function normalizeable(rawArticle: ArticleRaw): boolean {
  return Boolean(rawArticle.url || rawArticle.rawHash || rawArticle.title);
}

function reconcileExistingProcessed(nextArticles: ArticleProcessed[], existingProcessed: ArticleProcessed[]): ArticleProcessed[] {
  const existingById = new Map(existingProcessed.map((article) => [article.id, article]));

  return nextArticles.map((article) => {
    const existing = existingById.get(article.id);

    if (!existing) {
      return article;
    }

    const nextSnapshot = articleSnapshot(article);
    const existingSnapshot = articleSnapshot(existing);

    if (nextSnapshot === existingSnapshot) {
      return existing;
    }

    return {
      ...article,
      processingTimestamp: new Date().toISOString()
    };
  });
}

function articleSnapshot(article: ArticleProcessed): string {
  return JSON.stringify({
    id: article.id,
    dedupGroupId: article.dedupGroupId,
    canonicalUrl: article.canonicalUrl,
    title: article.title,
    snippet: article.snippet,
    publishedAt: article.publishedAt,
    categories: article.categories,
    sources: article.sources,
    pipelineVersion: article.pipelineVersion,
    scoreSignals: article.scoreSignals ?? null
  });
}
