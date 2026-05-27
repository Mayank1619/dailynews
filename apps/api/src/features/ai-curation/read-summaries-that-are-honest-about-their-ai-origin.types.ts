import type { ArticleSummaryRecord } from "./contracts";

export interface ReadSummariesThatAreHonestAboutTheirAiOriginInput {
  items: ArticleSummaryRecord[];
}

export interface RenderableDigestItem extends ArticleSummaryRecord {
  attributionUrl: string;
}

export interface ReadSummariesThatAreHonestAboutTheirAiOriginResult {
  items: RenderableDigestItem[];
}
