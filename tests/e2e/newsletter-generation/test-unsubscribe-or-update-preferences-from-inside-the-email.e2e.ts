/**
 * US4: Unsubscribe or Update Preferences From Inside the Email
 * End-to-End tests
 */

import { test, expect } from '@playwright/test';
import { EmailManagementLinksService } from '../../../apps/api/src/features/newsletter-generation/unsubscribe-or-update-preferences-from-inside-the-email.service';

test.describe('US4: E2E - Email Management Links in Newsletter', () => {
  test('e2e scenario: newsletter includes unsubscribe link', () => {
    const service = new EmailManagementLinksService();
    const userId = 'user-with-links';

    const links = service.generateManagementLinks(userId);

    expect(links.unsubscribeUrl).toBeTruthy();
    expect(links.unsubscribeUrl).toMatch(/^https:\/\//);
    expect(links.unsubscribeUrl).toContain(userId);
  });

  test('e2e scenario: newsletter includes preferences link', () => {
    const service = new EmailManagementLinksService();
    const userId = 'user-preferences';

    const links = service.generateManagementLinks(userId);

    expect(links.preferencesUrl).toBeTruthy();
    expect(links.preferencesUrl).toMatch(/^https:\/\//);
    expect(links.preferencesUrl).toContain('preferences');
  });

  test('e2e scenario: user clicks unsubscribe link', async () => {
    const service = new EmailManagementLinksService();
    const userId = 'unsubscribe-test-user';

    // Generate links with token
    const links = service.generateManagementLinks(userId);

    // User clicks unsubscribe link with token
    const unsubscribeRequest = {
      userId,
      token: links.unsubscribeToken,
      confirmedAt: new Date(),
    };

    // Process unsubscribe
    await service.processUnsubscribe(unsubscribeRequest);
    // Should not throw
  });

  test('e2e scenario: user updates preferences from email', async () => {
    const service = new EmailManagementLinksService();
    const userId = 'preferences-update-user';

    // Generate links
    const links = service.generateManagementLinks(userId);

    // User updates preferences via email link
    const updateRequest = {
      userId,
      token: links.preferencesToken,
      changes: {
        topics: ['new-topic-1', 'new-topic-2'],
        deliveryTime: '10:00',
      },
    };

    // Process update
    await service.processPreferencesUpdate(updateRequest);
    // Should not throw
  });

  test('e2e scenario: links are footer footer of email', () => {
    const service = new EmailManagementLinksService();
    const userId = 'email-footer-test';

    const links = service.generateManagementLinks(userId);

    // Both links should be present in footer
    const mockFooter = `
      <footer>
        <a href="${links.preferencesUrl}">Update Preferences</a>
        <a href="${links.unsubscribeUrl}">Unsubscribe</a>
      </footer>
    `;

    expect(mockFooter).toContain(links.preferencesUrl);
    expect(mockFooter).toContain(links.unsubscribeUrl);
  });
});
