import type { ArticleSummaryRecord, ProcessedArticle } from "./contracts";
import type { CurationSummarizer, RankedDigestResult, ReceiveARankedSummarizedDigestInput, SummarizerResult } from "./receive-a-ranked-summarized-digest-of-relevant-stories.types";
import { ReceiveARankedSummarizedDigestTelemetry } from "./receive-a-ranked-summarized-digest-of-relevant-stories.telemetry";

class DeterministicSummarizer implements CurationSummarizer {
  async summarize(article: ProcessedArticle): Promise<SummarizerResult> {
    const snippet = article.snippet.trim();

    return {
      summaryText: snippet ? `${article.title}: ${snippet}` : article.title,
      bulletPoints: [],
      modelInfo: {
        modelName: "deterministic-curation-v1",
        modelVersion: "1.0.0",
        invokedAt: new Date().toISOString()
      }
    };
  }
}

export class ReceiveARankedSummarizedDigestOfRelevantStoriesService {
  constructor(
    private readonly summarizer: CurationSummarizer = new DeterministicSummarizer(),
    private readonly telemetry = new ReceiveARankedSummarizedDigestTelemetry()
  ) {}

  async curate(input: ReceiveARankedSummarizedDigestInput): Promise<RankedDigestResult> {
    if (input.perCategoryLimit !== undefined && input.perCategoryLimit <= 0) {
      throw new Error("perCategoryLimit must be greater than zero");
    }

    const sorted = deduplicateAndRank(input.articles, input.preference.topics);
    const draftedItems: ArticleSummaryRecord[] = [];

    for (const candidate of sorted) {
      this.telemetry.recordArticleEvaluated();
      draftedItems.push(await this.toSummary(candidate.article, candidate.score, input.cache));
    }

    const items = applyPerCategoryLimit(draftedItems, input.perCategoryLimit);

    return {
      items,
      metrics: this.telemetry.getSnapshot()
    };
  }

  private async toSummary(article: ProcessedArticle, rankedScore: number, cache?: Map<string, ArticleSummaryRecord>): Promise<ArticleSummaryRecord> {
    const cached = cache?.get(article.id);

    if (cached) {
      this.telemetry.recordCacheHit();
      return {
        ...cached,
        rankedScore
      };
    }

    try {
      const result = await this.summarizer.summarize(article);

      if (!result.summaryText && result.bulletPoints.length === 0) {
        this.telemetry.recordFallbackApplied();
        return buildFallback(article, rankedScore);
      }

      const summary: ArticleSummaryRecord = {
        id: `sum_${article.id}`,
        processedArticleId: article.id,
        title: article.title,
        summaryText: result.summaryText,
        bulletPoints: result.bulletPoints,
        fallbackApplied: false,
        source: {
          sourceName: article.sourceName,
          canonicalUrl: article.canonicalUrl
        },
        modelInfo: result.modelInfo,
        rankedScore,
        categories: article.categories,
        summaryLabel: "Summary",
        publishedAt: article.publishedAt
      };

      this.telemetry.recordAiSummaryGenerated();
      cache?.set(article.id, summary);
      return summary;
    } catch {
      this.telemetry.recordFailure();
      this.telemetry.recordFallbackApplied();
      return buildFallback(article, rankedScore);
    }
  }
}

interface RankedCandidate {
  article: ProcessedArticle;
  score: number;
}

function deduplicateAndRank(articles: ProcessedArticle[], topics: string[]): RankedCandidate[] {
  const deduped = new Map<string, ProcessedArticle>();

  for (const article of articles) {
    const existing = deduped.get(article.dedupGroupId);

    if (!existing || Date.parse(article.publishedAt) > Date.parse(existing.publishedAt)) {
      deduped.set(article.dedupGroupId, article);
    }
  }

  const normalizedTopics = topics.map((topic) => topic.toLowerCase());

  return [...deduped.values()]
    .map((article) => ({
      article,
      score: computeRankScore(article, normalizedTopics)
    }))
    .sort((left, right) => right.score - left.score);
}

function computeRankScore(article: ProcessedArticle, topics: string[]): number {
  const topicMatches = article.categories.filter((category) => topics.includes(category.toLowerCase())).length;
  const publishedAt = Date.parse(article.publishedAt) || 0;

  return topicMatches * 1_000_000_000_000 + publishedAt;
}

function applyPerCategoryLimit(items: ArticleSummaryRecord[], perCategoryLimit?: number): ArticleSummaryRecord[] {
  if (!perCategoryLimit) {
    return items;
  }

  const counters: Record<string, number> = {};
  const limited: ArticleSummaryRecord[] = [];

  for (const item of items) {
    const category = item.categories[0] ?? "uncategorized";
    const count = counters[category] ?? 0;

    if (count < perCategoryLimit) {
      counters[category] = count + 1;
      limited.push(item);
    }
  }

  return limited;
}

function buildFallback(article: ProcessedArticle, rankedScore: number): ArticleSummaryRecord {
  const fallbackText = [article.title, article.snippet].filter(Boolean).join(" - ");

  return {
    id: `sum_${article.id}`,
    processedArticleId: article.id,
    title: article.title,
    summaryText: fallbackText,
    bulletPoints: [],
    fallbackApplied: true,
    source: {
      sourceName: article.sourceName,
      canonicalUrl: article.canonicalUrl
    },
    modelInfo: {
      modelName: null,
      modelVersion: null,
      invokedAt: null
    },
    rankedScore,
    categories: article.categories,
    summaryLabel: null,
    publishedAt: article.publishedAt
  };
}
