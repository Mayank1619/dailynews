/**
 * US3: Read Clearly Attributed Stories With an Honest AI Label
 * Unit tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AttributionService } from '../../../apps/api/src/features/newsletter-generation/read-clearly-attributed-stories-with-an-honest-ai-label.service';

describe('US3: Read Clearly Attributed Stories With an Honest AI Label - Unit Tests', () => {
  let service: AttributionService;

  beforeEach(() => {
    service = new AttributionService();
  });

  it('should validate story attribution', () => {
    const story = {
      id: 'story-1',
      title: 'Test Article',
      snippet: 'Test snippet',
      source: 'TechNews',
      canonicalUrl: 'https://technews.com/article',
      publicationDate: new Date(),
      isAISummary: true,
    };

    const result = service.validateAttribution(story);

    expect(result.hasAttribution).toBe(true);
    expect(result.hasAILabel).toBe(true);
    expect(result.aiLabelText).toBe('Summary');
  });

  it('should detect missing source', () => {
    const story = {
      id: 'story-1',
      title: 'Test Article',
      snippet: 'Test snippet',
      source: '',
      canonicalUrl: 'https://technews.com/article',
      publicationDate: new Date(),
      isAISummary: false,
    };

    const result = service.validateAttribution(story);

    expect(result.attributionText).toBe('');
  });

  it('should detect invalid URL', () => {
    const story = {
      id: 'story-1',
      title: 'Test Article',
      snippet: 'Test snippet',
      source: 'TechNews',
      canonicalUrl: 'not-a-url',
      publicationDate: new Date(),
      isAISummary: false,
    };

    const result = service.validateAttribution(story);

    expect(result.hasAttribution).toBe(false);
  });

  it('should label AI-summarized content', () => {
    const story = {
      id: 'story-1',
      title: 'Test Article',
      snippet: 'Test snippet',
      source: 'TechNews',
      canonicalUrl: 'https://technews.com/article',
      publicationDate: new Date(),
      isAISummary: true,
    };

    const result = service.validateAttribution(story);

    expect(result.hasAILabel).toBe(true);
    expect(result.aiLabelText).toBe('Summary');
  });

  it('should not label non-AI content', () => {
    const story = {
      id: 'story-1',
      title: 'Test Article',
      snippet: 'Test snippet',
      source: 'TechNews',
      canonicalUrl: 'https://technews.com/article',
      publicationDate: new Date(),
      isAISummary: false,
    };

    const result = service.validateAttribution(story);

    expect(result.aiLabelText).toBeUndefined();
  });

  it('should build attribution text', () => {
    const story = {
      id: 'story-1',
      title: 'Test Article',
      snippet: 'Test snippet',
      source: 'TechNews',
      canonicalUrl: 'https://technews.com/article',
      publicationDate: new Date('2026-05-27'),
      isAISummary: false,
    };

    const enriched = service.enrichStoryWithAttribution(story);

    expect(enriched.attributionText).toContain('TechNews');
    expect(enriched.attributionText).toContain('May 27');
  });
});
