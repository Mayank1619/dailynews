import type { ProcessingFailure } from "./contracts";

export interface ContentProcessingTelemetrySnapshot {
  rawArticlesIngested: number;
  normalizedArticles: number;
  dedupGroupsCreated: number;
  mergedIntoExistingGroups: number;
  newArticlesStored: number;
  updatedArticlesStored: number;
  taxonomyAssignments: Record<string, number>;
  noCategoryMatches: number;
  failures: number;
  failureLog: ProcessingFailure[];
}

export class ContentProcessingTelemetry {
  private rawArticlesIngested = 0;
  private normalizedArticles = 0;
  private dedupGroupsCreated = 0;
  private mergedIntoExistingGroups = 0;
  private newArticlesStored = 0;
  private updatedArticlesStored = 0;
  private taxonomyAssignments: Record<string, number> = {};
  private noCategoryMatches = 0;
  private failureLog: ProcessingFailure[] = [];

  recordRawArticlesIngested(count = 1): void {
    this.rawArticlesIngested += count;
  }

  recordNormalizedArticles(count = 1): void {
    this.normalizedArticles += count;
  }

  recordDedupGroupsCreated(count = 1): void {
    this.dedupGroupsCreated += count;
  }

  recordMergedIntoExistingGroups(count = 1): void {
    this.mergedIntoExistingGroups += count;
  }

  recordNewArticlesStored(count = 1): void {
    this.newArticlesStored += count;
  }

  recordUpdatedArticlesStored(count = 1): void {
    this.updatedArticlesStored += count;
  }

  recordCategoryAssignment(category: string, count = 1): void {
    this.taxonomyAssignments[category] = (this.taxonomyAssignments[category] ?? 0) + count;
  }

  recordNoCategoryMatch(count = 1): void {
    this.noCategoryMatches += count;
  }

  recordFailure(failure: ProcessingFailure): void {
    this.failureLog.push(failure);
  }

  getSnapshot(): ContentProcessingTelemetrySnapshot {
    return {
      rawArticlesIngested: this.rawArticlesIngested,
      normalizedArticles: this.normalizedArticles,
      dedupGroupsCreated: this.dedupGroupsCreated,
      mergedIntoExistingGroups: this.mergedIntoExistingGroups,
      newArticlesStored: this.newArticlesStored,
      updatedArticlesStored: this.updatedArticlesStored,
      taxonomyAssignments: { ...this.taxonomyAssignments },
      noCategoryMatches: this.noCategoryMatches,
      failures: this.failureLog.length,
      failureLog: [...this.failureLog]
    };
  }
}
