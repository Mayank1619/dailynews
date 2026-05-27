/**
 * US3: Read Clearly Attributed Stories With an Honest AI Label
 * Types and interfaces
 */

export interface AttributionRequirement {
  storyId: string;
  source: string;
  canonicalUrl: string;
  publicationDate: Date;
  isSummarized: boolean;
}

export interface AttributedStory {
  id: string;
  title: string;
  snippet: string;
  source: string;
  canonicalUrl: string;
  publicationDate: Date;
  summaryLabel?: string;
  attributionText: string;
}

export interface AttributionCheckResult {
  storyId: string;
  hasAttribution: boolean;
  hasAILabel: boolean;
  attributionText: string;
  aiLabelText?: string;
}

export interface AttributionPolicy {
  requireSourceName: boolean;
  requireCanonicalUrl: boolean;
  requirePublicationDate: boolean;
  requireAISummaryLabel: boolean;
  labelForAISummary: string;
}

export const DEFAULT_ATTRIBUTION_POLICY: AttributionPolicy = {
  requireSourceName: true,
  requireCanonicalUrl: true,
  requirePublicationDate: true,
  requireAISummaryLabel: true,
  labelForAISummary: 'Summary',
};
