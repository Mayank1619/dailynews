/**
 * US4: Unsubscribe or Update Preferences From Inside the Email
 * Integration tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EmailManagementLinksService } from '../../../apps/api/src/features/newsletter-generation/unsubscribe-or-update-preferences-from-inside-the-email.service';

describe('US4: Integration - Email Management Links Contract', () => {
  let service: EmailManagementLinksService;

  beforeEach(() => {
    service = new EmailManagementLinksService();
  });

  it('should embed functional unsubscribe link', () => {
    const links = service.generateManagementLinks('user-test');

    expect(links.unsubscribeUrl).toMatch(/^https:\/\/app.dailynews.local\/unsubscribe\//);
    expect(links.unsubscribeUrl).toContain('token=');
  });

  it('should embed functional preferences link', () => {
    const links = service.generateManagementLinks('user-test');

    expect(links.preferencesUrl).toMatch(/^https:\/\/app.dailynews.local\/preferences\//);
    expect(links.preferencesUrl).toContain('token=');
  });

  it('should process valid unsubscribe request', async () => {
    const links = service.generateManagementLinks('user-123');
    const request = {
      userId: 'user-123',
      token: links.unsubscribeToken,
      confirmedAt: new Date(),
    };

    await service.processUnsubscribe(request);
    // Should not throw
  });

  it('should process preferences update request', async () => {
    const links = service.generateManagementLinks('user-456');
    const request = {
      userId: 'user-456',
      token: links.preferencesToken,
      changes: {
        topics: ['new-topic'],
      },
    };

    await service.processPreferencesUpdate(request);
    // Should not throw
  });
});
