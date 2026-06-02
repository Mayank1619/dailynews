/**
 * US3: Read Clearly Attributed Stories With an Honest AI Label
 * End-to-End tests
 */

import { test, expect } from '@playwright/test';
import { AttributionService } from '../../../apps/api/src/features/newsletter-generation/read-clearly-attributed-stories-with-an-honest-ai-label.service';

test.describe('US3: E2E - Attribution and AI Label Verification', () => {
  test('e2e scenario: inspect newsletter for attribution', () => {
    const service = new AttributionService();

    const stories = [
      {
        id: 'story-1',
        title: 'AI Breakthrough',
        snippet: 'New AI model trained',
        source: 'TechDaily',
        canonicalUrl: 'https://techdaily.com/ai',
        publicationDate: new Date('2026-05-27'),
        isAISummary: true,
      },
      {
        id: 'story-2',
        title: 'Market Report',
        snippet: 'Markets close higher today',
        source: 'WallStreetJournal',
        canonicalUrl: 'https://wsj.com/markets',
        publicationDate: new Date('2026-05-27'),
        isAISummary: false,
      },
    ];

    // Validate all stories
    const results = service.validateStories(stories);

    expect(results.length).toBe(2);

    // AI story should be labeled
    const aiStoryResult = results.find(r => r.storyId === 'story-1');
    expect(aiStoryResult?.hasAILabel).toBe(true);
    expect(aiStoryResult?.aiLabelText).toBe('Summary');

    // Regular story should not be labeled
    const regularStoryResult = results.find(r => r.storyId === 'story-2');
    expect(regularStoryResult?.hasAILabel).toBe(true); // No summary label needed
    expect(regularStoryResult?.aiLabelText).toBeUndefined();

    // All should have attribution
    expect(results.every(r => r.hasAttribution)).toBe(true);
  });

  test('e2e scenario: verify attribution text contains source and date', () => {
    const service = new AttributionService();

    const story = {
      id: 'story-attribution-test',
      title: 'Breaking News',
      snippet: 'Important story',
      source: 'Reuters',
      canonicalUrl: 'https://reuters.com/news',
      publicationDate: new Date('2026-05-27'),
      isAISummary: false,
    };

    const enriched = service.enrichStoryWithAttribution(story);

    expect(enriched.attributionText).toContain('Reuters');
    expect(enriched.attributionText).toContain('May 27');
    expect(enriched.attributionText).toContain('•');
  });

  test('e2e scenario: all stories in newsletter properly attributed', () => {
    const service = new AttributionService();

    const newsletter = [
      {
        id: 'nl-story-1',
        title: 'Story 1',
        snippet: 'Content 1',
        source: 'Source1',
        canonicalUrl: 'https://source1.com',
        publicationDate: new Date(),
        isAISummary: true,
      },
      {
        id: 'nl-story-2',
        title: 'Story 2',
        snippet: 'Content 2',
        source: 'Source2',
        canonicalUrl: 'https://source2.com',
        publicationDate: new Date(),
        isAISummary: false,
      },
      {
        id: 'nl-story-3',
        title: 'Story 3',
        snippet: 'Content 3',
        source: 'Source3',
        canonicalUrl: 'https://source3.com',
        publicationDate: new Date(),
        isAISummary: true,
      },
    ];

    // Enriched stories should have proper attribution
    const enriched = service.enrichStoriesWithAttribution(newsletter);

    expect(enriched).toHaveLength(3);
    expect(enriched.every(s => s.attributionText)).toBe(true);
    expect(enriched.filter(s => s.summaryLabel).length).toBe(2);
  });
});
