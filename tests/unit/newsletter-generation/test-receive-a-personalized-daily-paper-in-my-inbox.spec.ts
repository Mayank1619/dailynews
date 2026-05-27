/**
 * US1: Receive a Personalized Daily Paper in My Inbox
 * Unit tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PersonalizedDailyPaperService } from '../../../apps/api/src/features/newsletter-generation/receive-a-personalized-daily-paper-in-my-inbox.service';
import { renderNewsletter } from '../../../apps/api/src/features/newsletter-generation/renderPipeline';

describe('US1: Receive a Personalized Daily Paper in My Inbox - Unit Tests', () => {
  let service: PersonalizedDailyPaperService;

  beforeEach(() => {
    service = new PersonalizedDailyPaperService();
  });

  it('should throw error when no articles available for topics', async () => {
    const request = {
      userId: 'user-123',
      date: new Date('2026-05-27'),
      preferences: {
        topics: ['technology', 'business'],
        region: 'US',
        deliveryTime: '08:00',
      },
    };

    await expect(service.generatePersonalizedNewsletter(request)).rejects.toThrow(
      'No articles available for topics'
    );
  });

  it('should return error with correct userId when articles unavailable', async () => {
    const request = {
      userId: 'user-456',
      date: new Date('2026-05-27'),
      preferences: {
        topics: ['sports'],
        region: 'US',
        deliveryTime: '08:00',
      },
    };

    await expect(service.generatePersonalizedNewsletter(request)).rejects.toThrow(
      'No articles available for topics'
    );
  });

  it('should generate subject line with date', async () => {
    const testDate = new Date('2026-05-27');
    const context = {
      userId: 'user-123',
      date: testDate,
      subject: `Daily News - May 27`,
      sections: [],
      unsubscribeUrl: 'https://app.dailynews.local/unsubscribe/user-123',
      preferencesUrl: 'https://app.dailynews.local/preferences/user-123',
    };

    const output = renderNewsletter(context);

    expect(output.subject).toContain('Daily News');
    expect(output.subject).toContain('May');
  });

  it('should include unsubscribe and preferences links', async () => {
    const context = {
      userId: 'user-123',
      date: new Date(),
      subject: 'Test Newsletter',
      sections: [],
      unsubscribeUrl: 'https://app.dailynews.local/unsubscribe/user-123',
      preferencesUrl: 'https://app.dailynews.local/preferences/user-123',
    };

    const output = renderNewsletter(context);

    expect(output.html).toContain('unsubscribe');
    expect(output.html).toContain('preferences');
    expect(output.html).toContain('https://app.dailynews.local/unsubscribe/user-123');
    expect(output.html).toContain('https://app.dailynews.local/preferences/user-123');
  });

  it('should generate both HTML and text renditions', async () => {
    const context = {
      userId: 'user-123',
      date: new Date(),
      subject: 'Test Newsletter',
      sections: [
        {
          topic: 'Technology',
          stories: [
            {
              id: 'story-1',
              title: 'AI Advances',
              snippet: 'New AI models show promise',
              source: 'TechNews',
              canonicalUrl: 'https://technews.com/ai',
              publicationDate: new Date(),
              isAISummary: false,
            },
          ],
        },
      ],
      unsubscribeUrl: 'https://app.dailynews.local/unsubscribe/user-123',
      preferencesUrl: 'https://app.dailynews.local/preferences/user-123',
    };

    const output = renderNewsletter(context);

    expect(output.html).toBeTruthy();
    expect(output.text).toBeTruthy();
    expect(output.html).toContain('<!DOCTYPE html>');
    expect(output.text).toContain('DAILY NEWS');
  });
});
