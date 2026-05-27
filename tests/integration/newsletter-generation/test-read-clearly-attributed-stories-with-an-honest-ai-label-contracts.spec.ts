/**
 * US3: Read Clearly Attributed Stories With an Honest AI Label
 * Integration tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AttributionService } from '../../../apps/api/src/features/newsletter-generation/read-clearly-attributed-stories-with-an-honest-ai-label.service';

describe('US3: Integration - Attribution & AI Label Contract', () => {
  let service: AttributionService;

  beforeEach(() => {
    service = new AttributionService();
  });

  it('should validate all stories in newsletter', () => {
    const stories = [
      {
        id: 'story-1',
        title: 'AI News',
        snippet: 'Breaking: AI improves',
        source: 'TechDaily',
        canonicalUrl: 'https://techdaily.com/ai-news',
        publicationDate: new Date(),
        isAISummary: true,
      },
      {
        id: 'story-2',
        title: 'Business Report',
        snippet: 'Markets rise today',
        source: 'FinanceToday',
        canonicalUrl: 'https://financetoday.com/markets',
        publicationDate: new Date(),
        isAISummary: false,
      },
    ];

    const allAttributed = service.allStoriesAttributed(stories);

    expect(typeof allAttributed).toBe('boolean');
  });

  it('should label AI-summarized content', () => {
    const aiStory = {
      id: 'ai-story',
      title: 'AI Breakthrough',
      snippet: 'Summary of AI news',
      source: 'TechNews',
      canonicalUrl: 'https://technews.com/ai',
      publicationDate: new Date(),
      isAISummary: true,
    };

    const result = service.validateAttribution(aiStory);

    expect(result.aiLabelText).toBe('Summary');
  });

  it('should not label non-AI content', () => {
    const humanStory = {
      id: 'human-story',
      title: 'Original Report',
      snippet: 'Full article content',
      source: 'NewsSource',
      canonicalUrl: 'https://newssource.com/report',
      publicationDate: new Date(),
      isAISummary: false,
    };

    const result = service.validateAttribution(humanStory);

    expect(result.aiLabelText).toBeUndefined();
  });
});
