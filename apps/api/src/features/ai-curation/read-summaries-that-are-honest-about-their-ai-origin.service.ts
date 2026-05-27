import type { ReadSummariesThatAreHonestAboutTheirAiOriginInput, ReadSummariesThatAreHonestAboutTheirAiOriginResult } from "./read-summaries-that-are-honest-about-their-ai-origin.types";
import { ReadSummariesThatAreHonestAboutTheirAiOriginTelemetry } from "./read-summaries-that-are-honest-about-their-ai-origin.telemetry";

export class ReadSummariesThatAreHonestAboutTheirAiOriginService {
  constructor(private readonly telemetry = new ReadSummariesThatAreHonestAboutTheirAiOriginTelemetry()) {}

  annotate(input: ReadSummariesThatAreHonestAboutTheirAiOriginInput): ReadSummariesThatAreHonestAboutTheirAiOriginResult {
    const items = input.items.map((item) => {
      this.telemetry.recordArticleEvaluated();

      if (item.fallbackApplied) {
        this.telemetry.recordFallbackApplied();
      } else {
        this.telemetry.recordAiSummaryGenerated();
      }

      return {
        ...item,
        summaryLabel: item.fallbackApplied ? null : "Summary",
        attributionUrl: item.source.canonicalUrl
      };
    });

    return { items };
  }
}
