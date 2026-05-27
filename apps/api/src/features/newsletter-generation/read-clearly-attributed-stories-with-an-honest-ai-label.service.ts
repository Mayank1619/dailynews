/**
 * US3: Read Clearly Attributed Stories With an Honest AI Label
 * Service implementation
 */

import {
  AttributionRequirement,
  AttributedStory,
  AttributionCheckResult,
  AttributionPolicy,
  DEFAULT_ATTRIBUTION_POLICY,
} from './read-clearly-attributed-stories-with-an-honest-ai-label.types';

export class AttributionService {
  readonly policy: AttributionPolicy;

  constructor(policy?: Partial<AttributionPolicy>) {
    this.policy = {
      ...DEFAULT_ATTRIBUTION_POLICY,
      ...policy,
    };
  }

  /**
   * Validate story has complete attribution
   */
  validateAttribution(story: any): AttributionCheckResult {
    const checks = {
      hasSourceName: !!story.source,
      hasCanonicalUrl: this.isValidUrl(story.canonicalUrl),
      hasPublicationDate: !!story.publicationDate,
      hasAILabel: story.isAISummary ? true : false,
    };

    return {
      storyId: story.id,
      hasAttribution:
        (!this.policy.requireSourceName || checks.hasSourceName) &&
        (!this.policy.requireCanonicalUrl || checks.hasCanonicalUrl) &&
        (!this.policy.requirePublicationDate || checks.hasPublicationDate),
      hasAILabel: !this.policy.requireAISummaryLabel || checks.hasAILabel,
      attributionText: this.buildAttributionText(story),
      aiLabelText: story.isAISummary ? this.policy.labelForAISummary : undefined,
    };
  }

  /**
   * Validate array of stories
   */
  validateStories(stories: any[]): AttributionCheckResult[] {
    return stories.map(story => this.validateAttribution(story));
  }

  /**
   * Check if all stories pass attribution requirements
   */
  allStoriesAttributed(stories: any[]): boolean {
    return this.validateStories(stories).every(
      result => result.hasAttribution && result.hasAILabel
    );
  }

  /**
   * Build attribution text for story
   */
  private buildAttributionText(story: any): string {
    const parts = [];

    if (story.source) {
      parts.push(story.source);
    }

    if (story.publicationDate) {
      const date = new Date(story.publicationDate);
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      parts.push(dateStr);
    }

    return parts.join(' • ');
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Enrich story with attribution metadata
   */
  enrichStoryWithAttribution(story: any): AttributedStory {
    const check = this.validateAttribution(story);

    return {
      id: story.id,
      title: story.title,
      snippet: story.snippet,
      source: story.source,
      canonicalUrl: story.canonicalUrl,
      publicationDate: story.publicationDate,
      summaryLabel: check.aiLabelText,
      attributionText: check.attributionText,
    };
  }

  /**
   * Enrich stories with attribution
   */
  enrichStoriesWithAttribution(stories: any[]): AttributedStory[] {
    return stories.map(story => this.enrichStoryWithAttribution(story));
  }
}

export const attributionService = new AttributionService();
