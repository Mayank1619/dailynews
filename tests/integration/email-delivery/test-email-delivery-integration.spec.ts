/**
 * Integration Tests: Email Delivery Pipeline
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DeliveryEligibilityService } from '../../../apps/api/src/features/email-delivery/delivery-eligibility.service';
import { ReceiveMyNewsletterAtTheTimeIChoseService } from '../../../apps/api/src/features/email-delivery/receive-my-newsletter-at-the-time-i-chose.service';
import { MyUnsubscribeRequestIsHonouredImmediatelyService } from '../../../apps/api/src/features/email-delivery/my-unsubscribe-request-is-honoured-immediately.service';
import { UnverifiedAndBlockedUsersAreNeverSentEmailService } from '../../../apps/api/src/features/email-delivery/unverified-and-blocked-users-are-never-sent-email.service';
import { OperatorsCanSeeDeliveryHealthService } from '../../../apps/api/src/features/email-delivery/operators-can-see-delivery-health-without-accessing-personal-data.service';
import { UserPreferences, Newsletter } from '../../../apps/api/src/features/email-delivery/email-delivery.types';

describe('Integration: Email Delivery Workflow', () => {
  let eligibilityService: DeliveryEligibilityService;
  let schedulingService: ReceiveMyNewsletterAtTheTimeIChoseService;
  let unsubscribeService: MyUnsubscribeRequestIsHonouredImmediatelyService;
  let blockService: UnverifiedAndBlockedUsersAreNeverSentEmailService;
  let healthService: OperatorsCanSeeDeliveryHealthService;

  beforeEach(() => {
    eligibilityService = new DeliveryEligibilityService();
    schedulingService = new ReceiveMyNewsletterAtTheTimeIChoseService(eligibilityService);
    unsubscribeService = new MyUnsubscribeRequestIsHonouredImmediatelyService();
    blockService = new UnverifiedAndBlockedUsersAreNeverSentEmailService(eligibilityService);
    healthService = new OperatorsCanSeeDeliveryHealthService();
  });

  it('should complete end-to-end delivery workflow for eligible user', () => {
    // Setup
    const prefs: UserPreferences = {
      userId: 'user1',
      email: 'user@example.com',
      deliveryTime: '09:00',
      timezone: 'UTC',
      newsletterEnabled: true,
      isVerified: true,
    };

    const newsletter: Newsletter = {
      id: 'news1',
      status: 'generated',
      content: 'Content',
      subject: 'Subject',
      createdAt: new Date(),
      publishDate: new Date(),
    };

    // Eligibility check
    const eligibility = eligibilityService.checkEligibility(prefs);
    expect(eligibility.eligible).toBe(true);

    // Schedule delivery
    const scheduled = schedulingService.scheduleDelivery(prefs, newsletter);
    expect(scheduled.scheduled).toBe(true);

    // Enforce zero-tolerance
    const enforced = blockService.enforceEligibility(prefs);
    expect(enforced.pass).toBe(true);
  });

  it('should prevent unverified users from receiving email', () => {
    const prefs: UserPreferences = {
      userId: 'user2',
      email: 'unverified@example.com',
      deliveryTime: '09:00',
      timezone: 'UTC',
      newsletterEnabled: true,
      isVerified: false,
    };

    const eligibility = eligibilityService.checkEligibility(prefs);
    expect(eligibility.eligible).toBe(false);
    expect(eligibility.reason).toBe('email_not_verified');

    const enforced = blockService.enforceEligibility(prefs);
    expect(enforced.pass).toBe(false);
  });

  it('should honor unsubscribe requests', () => {
    const prefs: UserPreferences = {
      userId: 'user3',
      email: 'unsubscribe@example.com',
      deliveryTime: '09:00',
      timezone: 'UTC',
      newsletterEnabled: true,
      isVerified: true,
    };

    // Unsubscribe
    const result = unsubscribeService.processUnsubscribe(
      {
        userId: 'user3',
        requestedAt: new Date(),
        source: 'email_link',
      },
      prefs,
    );

    expect(result.unsubscribed).toBe(true);

    // Updated preferences
    const updatedPrefs = { ...prefs, newsletterEnabled: false };

    // Should not be eligible after unsubscribe
    const eligibility = eligibilityService.checkEligibility(updatedPrefs);
    expect(eligibility.eligible).toBe(false);
  });

  it('should prevent blocked users from receiving email', () => {
    const prefs: UserPreferences = {
      userId: 'user4',
      email: 'blocked@example.com',
      deliveryTime: '09:00',
      timezone: 'UTC',
      newsletterEnabled: true,
      isVerified: true,
    };

    const eligibility = eligibilityService.checkEligibility(prefs, true); // blocked = true
    expect(eligibility.eligible).toBe(false);
    expect(eligibility.reason).toBe('account_blocked');

    const enforced = blockService.enforceEligibility(prefs, true);
    expect(enforced.pass).toBe(false);
  });
});
