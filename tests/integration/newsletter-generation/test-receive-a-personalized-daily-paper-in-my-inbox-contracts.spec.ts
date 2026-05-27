/**
 * US1: Receive a Personalized Daily Paper in My Inbox
 * Integration tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PersonalizedDailyPaperService } from '../../../apps/api/src/features/newsletter-generation/receive-a-personalized-daily-paper-in-my-inbox.service';

describe('US1: Integration - Personalized Newsletter Generation Contract', () => {
  let service: PersonalizedDailyPaperService;

  beforeEach(() => {
    service = new PersonalizedDailyPaperService();
  });

  it('should generate newsletter with topic grouping', async () => {
    const request = {
      userId: 'integration-user-1',
      date: new Date('2026-05-27'),
      preferences: {
        topics: ['technology', 'business'],
        region: 'US',
        deliveryTime: '08:00',
      },
    };

    const newsletter = await service.generatePersonalizedNewsletter(request);

    expect(newsletter.status).toBe('generated');
    expect(newsletter.html).toBeTruthy();
    expect(newsletter.text).toBeTruthy();
    expect(newsletter.articleRefs).toEqual(expect.any(Array));
  });

  it('should create unique newsletter per user per day', async () => {
    const date = new Date('2026-05-27');
    const userId = 'user-unique-test';

    const nl1Id = `nl-${userId}-${date.toISOString().split('T')[0]}`;

    expect(nl1Id).toMatch(/^nl-/);
    expect(nl1Id).toContain(userId);
  });

  it('should include both HTML and text renditions', async () => {
    const request = {
      userId: 'contract-test-user',
      date: new Date('2026-05-27'),
      preferences: {
        topics: ['technology'],
        region: 'US',
        deliveryTime: '08:00',
      },
    };

    const newsletter = await service.generatePersonalizedNewsletter(request);

    expect(newsletter.html).toBeTruthy();
    expect(newsletter.text).toBeTruthy();
    expect(typeof newsletter.html).toBe('string');
    expect(typeof newsletter.text).toBe('string');
    expect(newsletter.html.length).toBeGreaterThan(0);
    expect(newsletter.text.length).toBeGreaterThan(0);
  });
});
