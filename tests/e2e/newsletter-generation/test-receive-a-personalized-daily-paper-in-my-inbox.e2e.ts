/**
 * US1: Receive a Personalized Daily Paper in My Inbox
 * End-to-End tests
 */

import { describe, it, expect } from 'vitest';
import { PersonalizedDailyPaperService } from '../../../apps/api/src/features/newsletter-generation/receive-a-personalized-daily-paper-in-my-inbox.service';
import { renderNewsletter } from '../../../apps/api/src/features/newsletter-generation/renderPipeline';

describe('US1: E2E - Receive Personalized Daily Paper', () => {
  it('should generate end-to-end newsletter for user', async () => {
    const service = new PersonalizedDailyPaperService();
    
    const request = {
      userId: 'e2e-user-1',
      date: new Date('2026-05-27'),
      preferences: {
        topics: ['technology', 'business'],
        region: 'US',
        deliveryTime: '08:00',
      },
    };

    const newsletter = await service.generatePersonalizedNewsletter(request);

    // Verify newsletter structure
    expect(newsletter.id).toBeTruthy();
    expect(newsletter.userId).toBe('e2e-user-1');
    expect(newsletter.date.toDateString()).toContain('2026');
    expect(newsletter.subject).toContain('Daily News');
    expect(newsletter.html).toBeTruthy();
    expect(newsletter.text).toBeTruthy();
    expect(newsletter.status).toBe('generated');
    expect(newsletter.articleRefs).toEqual(expect.any(Array));
    expect(newsletter.generatedAt).toBeInstanceOf(Date);
  });

  it('should render proper HTML structure', () => {
    const context = {
      userId: 'test-user',
      date: new Date('2026-05-27'),
      subject: 'Daily News - May 27',
      sections: [
        {
          topic: 'Technology',
          stories: [
            {
              id: 'story-1',
              title: 'AI Advances',
              snippet: 'New AI breakthroughs',
              source: 'TechNews',
              canonicalUrl: 'https://technews.com/ai',
              publicationDate: new Date(),
              isAISummary: true,
            },
          ],
        },
      ],
      unsubscribeUrl: 'https://app.dailynews.local/unsubscribe/user',
      preferencesUrl: 'https://app.dailynews.local/preferences/user',
    };

    const output = renderNewsletter(context);

    // Verify HTML
    expect(output.html).toContain('<!DOCTYPE html>');
    expect(output.html).toContain('Daily News');
    expect(output.html).toContain('Technology');
    expect(output.html).toContain('AI Advances');
    expect(output.html).toContain('TechNews');
    expect(output.html).toContain('Summary');
    expect(output.html).toContain('unsubscribe');
    expect(output.html).toContain('preferences');

    // Verify text
    expect(output.text).toContain('Daily News');
    expect(output.text).toContain('TECHNOLOGY');
    expect(output.text).toContain('AI Advances');
    expect(output.text).toContain('[Summary]');
  });

  it('e2e scenario: complete user journey from generation to preview', async () => {
    const userId = 'e2e-journey-user';
    const date = new Date('2026-05-27');

    // Step 1: User has preferences set
    const preferences = {
      topics: ['sports', 'entertainment'],
      region: 'US',
      deliveryTime: '09:00',
    };

    // Step 2: Generate newsletter
    const service = new PersonalizedDailyPaperService();
    const request = { userId, date, preferences };
    const newsletter = await service.generatePersonalizedNewsletter(request);

    // Step 3: Verify newsletter is ready for delivery
    expect(newsletter.status).toBe('generated');
    expect(newsletter.html.length).toBeGreaterThan(100);
    expect(newsletter.text.length).toBeGreaterThan(50);

    // Step 4: Newsletter should have actionable links
    expect(newsletter.html).toContain('unsubscribe');
    expect(newsletter.html).toContain('preferences');
  });
});
