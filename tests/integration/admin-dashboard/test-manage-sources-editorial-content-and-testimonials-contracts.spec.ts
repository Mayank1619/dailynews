import { describe, expect, it, vi } from "vitest";
import {
  ManageSourcesEditorialContentAndTestimonialsService
} from "../../../apps/api/src/features/admin-dashboard/manage-sources-editorial-content-and-testimonials.service";
import { AdminAuditLogService } from "../../../apps/api/src/services/adminAuditLogService";

describe("US3 integration: manage sources, editorial content, and testimonials contracts", () => {
  it("add-source contract: validates URL, saves record, and emits audit entry", async () => {
    const auditSink = vi.fn();
    const addFn = vi.fn().mockResolvedValue({ id: "src-1", name: "AP Feed", type: "rss", url: "https://apnews.com/rss", enabled: false, createdAt: "2026-05-26T00:00:00.000Z" });

    const svc = new ManageSourcesEditorialContentAndTestimonialsService({
      sourceRepository: { add: addFn, edit: vi.fn(), toggle: vi.fn(), list: vi.fn().mockResolvedValue([]) },
      postRepository: { upsert: vi.fn(), setStatus: vi.fn() },
      testimonialRepository: { moderate: vi.fn() },
      auditLog: new AdminAuditLogService(auditSink),
      telemetry: { track: vi.fn() }
    });

    const source = await svc.addSource({ actorUid: "admin-uid", actorRole: "admin", name: "AP Feed", type: "rss", url: "https://apnews.com/rss" });

    expect(source.id).toBe("src-1");
    expect(addFn).toHaveBeenCalled();
    expect(auditSink).toHaveBeenCalledWith(expect.objectContaining({ actionType: "add_source" }));
  });

  it("invalid source URL is blocked before any repository call", async () => {
    const addFn = vi.fn();
    const svc = new ManageSourcesEditorialContentAndTestimonialsService({
      sourceRepository: { add: addFn, edit: vi.fn(), toggle: vi.fn(), list: vi.fn().mockResolvedValue([]) },
      postRepository: { upsert: vi.fn(), setStatus: vi.fn() },
      testimonialRepository: { moderate: vi.fn() },
      auditLog: new AdminAuditLogService(vi.fn()),
      telemetry: { track: vi.fn() }
    });

    await expect(svc.addSource({ actorUid: "admin-uid", actorRole: "admin", name: "Bad", type: "rss", url: "ftp://not-valid" })).rejects.toThrow("Invalid source URL");
    expect(addFn).not.toHaveBeenCalled();
  });

  it("publish-post contract: sets published status and emits publish audit entry", async () => {
    const auditSink = vi.fn();
    const setStatusFn = vi.fn().mockResolvedValue({ id: "post-1", title: "Breaking", content: "...", tags: [], status: "published", createdAt: "2026-05-26T00:00:00.000Z", updatedAt: "2026-05-26T00:00:00.000Z", publishedAt: "2026-05-26T10:00:00.000Z" });

    const svc = new ManageSourcesEditorialContentAndTestimonialsService({
      sourceRepository: { add: vi.fn(), edit: vi.fn(), toggle: vi.fn(), list: vi.fn().mockResolvedValue([]) },
      postRepository: { upsert: vi.fn(), setStatus: setStatusFn },
      testimonialRepository: { moderate: vi.fn() },
      auditLog: new AdminAuditLogService(auditSink),
      telemetry: { track: vi.fn() }
    });

    const post = await svc.setPostStatus("admin-uid", "admin", "post-1", "published");
    expect(post.status).toBe("published");
    expect(auditSink).toHaveBeenCalledWith(expect.objectContaining({ actionType: "publish_post", targetId: "post-1" }));
  });

  it("testimonial moderation contract: approve action persists status and emits audit", async () => {
    const auditSink = vi.fn();
    const moderateFn = vi.fn().mockResolvedValue({ id: "t-1", authorName: "Alice", content: "Love it", status: "approved", createdAt: "2026-05-01T00:00:00.000Z" });

    const svc = new ManageSourcesEditorialContentAndTestimonialsService({
      sourceRepository: { add: vi.fn(), edit: vi.fn(), toggle: vi.fn(), list: vi.fn().mockResolvedValue([]) },
      postRepository: { upsert: vi.fn(), setStatus: vi.fn() },
      testimonialRepository: { moderate: moderateFn },
      auditLog: new AdminAuditLogService(auditSink),
      telemetry: { track: vi.fn() }
    });

    const t = await svc.moderateTestimonial({ actorUid: "admin-uid", actorRole: "admin", testimonialId: "t-1", action: "approve" });
    expect(t.status).toBe("approved");
    expect(auditSink).toHaveBeenCalledWith(expect.objectContaining({ actionType: "approve_testimonial" }));
  });
});
