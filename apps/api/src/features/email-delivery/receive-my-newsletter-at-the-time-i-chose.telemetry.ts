/**
 * User Story 1: Receive My Newsletter at the Time I Chose
 * Telemetry and audit logging
 */

import { AuditEvent } from './delivery-telemetry.service';

export interface ScheduleAuditEvent {
  userId: string;
  newsletterId: string;
  timezone: string;
  deliveryTime: string;
  scheduled: boolean;
  reason?: string;
  timestamp: Date;
}

export class ReceiveMyNewsletterTelemetry {
  private events: ScheduleAuditEvent[] = [];

  /**
   * Record scheduling event
   */
  recordScheduleEvent(event: Omit<ScheduleAuditEvent, 'timestamp'>): void {
    this.events.push({
      ...event,
      timestamp: new Date(),
    });
  }

  /**
   * Get events for a user
   */
  getUserEvents(userId: string): ScheduleAuditEvent[] {
    return this.events.filter((e) => e.userId === userId);
  }

  /**
   * Get summary statistics
   */
  getSummary(): Record<string, unknown> {
    const total = this.events.length;
    const scheduled = this.events.filter((e) => e.scheduled).length;
    const unscheduled = total - scheduled;

    const reasonCounts: Record<string, number> = {};
    this.events.forEach((e) => {
      if (!e.scheduled && e.reason) {
        reasonCounts[e.reason] = (reasonCounts[e.reason] || 0) + 1;
      }
    });

    return {
      totalEvents: total,
      successfulSchedules: scheduled,
      failedSchedules: unscheduled,
      failureReasons: reasonCounts,
    };
  }
}
