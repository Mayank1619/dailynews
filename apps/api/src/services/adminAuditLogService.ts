export type AdminActionType =
  | "access_granted"
  | "access_denied"
  | "block_user"
  | "unblock_user"
  | "view_consent"
  | "add_source"
  | "edit_source"
  | "enable_source"
  | "disable_source"
  | "create_post"
  | "edit_post"
  | "publish_post"
  | "unpublish_post"
  | "approve_testimonial"
  | "remove_testimonial"
  | "export_consent_list";

export type AdminActionOutcome = "success" | "denied" | "error";

export type AdminActionLog = {
  actorUid: string;
  actorRole: string;
  actionType: AdminActionType;
  targetType: string;
  targetId: string;
  outcome: AdminActionOutcome;
  reason?: string;
  timestamp: string;
};

export type AdminAuditLogSink = (entry: AdminActionLog) => void | Promise<void>;

export class AdminAuditLogService {
  constructor(
    private readonly sink: AdminAuditLogSink = (entry) => console.info(JSON.stringify(entry))
  ) {}

  async record(entry: Omit<AdminActionLog, "timestamp">): Promise<void> {
    const stamped: AdminActionLog = {
      ...entry,
      timestamp: new Date().toISOString()
    };
    await this.sink(stamped);
  }
}
