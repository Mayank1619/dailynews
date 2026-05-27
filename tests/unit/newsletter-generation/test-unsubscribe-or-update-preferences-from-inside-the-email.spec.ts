/**
 * US4: Unsubscribe or Update Preferences From Inside the Email
 * Unit tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EmailManagementLinksService } from '../../../apps/api/src/features/newsletter-generation/unsubscribe-or-update-preferences-from-inside-the-email.service';

describe('US4: Unsubscribe or Update Preferences From Inside the Email - Unit Tests', () => {
  let service: EmailManagementLinksService;

  beforeEach(() => {
    service = new EmailManagementLinksService();
  });

  it('should generate management links', () => {
    const links = service.generateManagementLinks('user-123');

    expect(links).toHaveProperty('unsubscribeUrl');
    expect(links).toHaveProperty('preferencesUrl');
    expect(links).toHaveProperty('unsubscribeToken');
    expect(links).toHaveProperty('preferencesToken');
  });

  it('should include user ID in URLs', () => {
    const links = service.generateManagementLinks('user-123');

    expect(links.unsubscribeUrl).toContain('user-123');
    expect(links.preferencesUrl).toContain('user-123');
  });

  it('should include tokens in URLs', () => {
    const links = service.generateManagementLinks('user-123');

    expect(links.unsubscribeUrl).toContain('token=');
    expect(links.preferencesUrl).toContain('token=');
  });

  it('should generate different tokens for each purpose', () => {
    const links = service.generateManagementLinks('user-123');

    expect(links.unsubscribeToken).not.toBe(links.preferencesToken);
  });

  it('should process unsubscribe with valid token', async () => {
    const links = service.generateManagementLinks('user-123');
    const request = {
      userId: 'user-123',
      token: links.unsubscribeToken,
      confirmedAt: new Date(),
    };

    await service.processUnsubscribe(request);
    // Should not throw
  });

  it('should have functional unsubscribe and preferences URLs', () => {
    const links = service.generateManagementLinks('user-123');

    expect(links.unsubscribeUrl).toMatch(/^https:\/\//);
    expect(links.preferencesUrl).toMatch(/^https:\/\//);
  });
});
