/**
 * User Story 3: Unsubscribe Telemetry
 */

export interface UnsubscribeEvent {
  userId: string;
  action: 'subscribed' | 'unsubscribed' | 'resubscribed';
  source: string;
  timestamp: Date;
  previousState?: boolean;
}

export class UnsubscribeTelemetry {
  private events: UnsubscribeEvent[] = [];

  recordEvent(event: Omit<UnsubscribeEvent, 'timestamp'>): void {
    this.events.push({
      ...event,
      timestamp: new Date(),
    });
  }

  getEventsForUser(userId: string): UnsubscribeEvent[] {
    return this.events.filter((e) => e.userId === userId);
  }

  getSummary(): Record<string, unknown> {
    const unsubscribes = this.events.filter((e) => e.action === 'unsubscribed').length;
    const resubscribes = this.events.filter((e) => e.action === 'resubscribed').length;

    return {
      totalUnsubscribes: unsubscribes,
      totalResubscribes: resubscribes,
      net: unsubscribes - resubscribes,
    };
  }
}
