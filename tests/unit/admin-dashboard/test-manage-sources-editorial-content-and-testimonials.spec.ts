import { describe, expect, it, vi } from "vitest";
import {
  ManageSourcesEditorialContentAndTestimonialsService,
  type ManageSourcesDependencies,
  type PostRepository,
  type SourceRepository,
  type TestimonialRepository
} from "../../../apps/api/src/features/admin-dashboard/manage-sources-editorial-content-and-testimonials.service";
import { AdminAuditLogService } from "../../../apps/api/src/services/adminAuditLogService";

function createSourceRepository(): SourceRepository {
  return {
    async add(source) {
      return { id: "src-1", createdAt: "2026-05-26T00:00:00.000Z", ...source };
    },
    async edit(id, updates) {
      return { id, name: updates.name ?? "Updated Source", type: "rss", url: "https://example.com/feed", enabled: true, createdAt: "2026-05-01T00:00:00.000Z" };
    },
    async toggle(id, enabled) {
      return { id, name: "Test Source", type: "rss", url: "https://example.com/feed", enabled, createdAt: "2026-05-01T00:00:00.000Z" };
    },
    async list() { return []; }
  };
}

function createPostRepository(): PostRepository {
  return {
    async upsert(post) {
      return { id: "post-1", title: post.title, content: post.content ?? "", tags: post.tags ?? [], status: post.status ?? "draft", createdAt: "2026-05-26T00:00:00.000Z", updatedAt: "2026-05-26T00:00:00.000Z" };
    },
    async setStatus(id, status) {
      return { id, title: "Test Post", content: "Content", tags: [], status, createdAt: "2026-05-26T00:00:00.000Z", updatedAt: "2026-05-26T00:00:00.000Z", ...(status === "published" ? { publishedAt: "2026-05-26T10:00:00.000Z" } : {}) };
    }
  };
}

function createTestimonialRepository(): TestimonialRepository {
  return {
    async moderate(id, action) {
      return { id, authorName: "Test User", content: "Great app!", status: action === "approve" ? "approved" : "removed", createdAt: "2026-05-01T00:00:00.000Z" };
    }
  };
}

function createDeps(overrides?: Partial<ManageSourcesDependencies>): ManageSourcesDependencies {
  return {
    sourceRepository: createSourceRepository(),
    postRepository: createPostRepository(),
    testimonialRepository: createTestimonialRepository(),
    auditLog: new AdminAuditLogService(vi.fn()),
    telemetry: { track: vi.fn() },
    ...overrides
  };
}

describe("US3 unit: manage sources, editorial content, and testimonials", () => {
  it("adds a source with a valid URL and audit logs it", async () => {
    const auditSink = vi.fn();
    const svc = new ManageSourcesEditorialContentAndTestimonialsService(
      createDeps({ auditLog: new AdminAuditLogService(auditSink) })
    );

    const source = await svc.addSource({
      actorUid: "admin-uid",
      actorRole: "admin",
      name: "Reuters Feed",
      type: "rss",
      url: "https://reuters.com/rss"
    });

    expect(source.id).toBe("src-1");
    expect(auditSink).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: "add_source", outcome: "success" })
    );
  });

  it("rejects source with invalid URL", async () => {
    const svc = new ManageSourcesEditorialContentAndTestimonialsService(createDeps());
    await expect(
      svc.addSource({ actorUid: "admin-uid", actorRole: "admin", name: "Bad", type: "rss", url: "not-a-url" })
    ).rejects.toThrow("Invalid source URL");
  });

  it("toggles source enabled/disabled and audit logs it", async () => {
    const auditSink = vi.fn();
    const svc = new ManageSourcesEditorialContentAndTestimonialsService(
      createDeps({ auditLog: new AdminAuditLogService(auditSink) })
    );

    const result = await svc.toggleSource({ actorUid: "admin-uid", actorRole: "admin", sourceId: "src-1", enabled: true });
    expect(result.enabled).toBe(true);
    expect(auditSink).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: "enable_source" })
    );
  });

  it("publishes a post and audit logs the publish action", async () => {
    const auditSink = vi.fn();
    const svc = new ManageSourcesEditorialContentAndTestimonialsService(
      createDeps({ auditLog: new AdminAuditLogService(auditSink) })
    );

    const post = await svc.setPostStatus("admin-uid", "admin", "post-1", "published");
    expect(post.status).toBe("published");
    expect(auditSink).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: "publish_post" })
    );
  });

  it("approves a testimonial and audit logs it", async () => {
    const auditSink = vi.fn();
    const svc = new ManageSourcesEditorialContentAndTestimonialsService(
      createDeps({ auditLog: new AdminAuditLogService(auditSink) })
    );

    const t = await svc.moderateTestimonial({ actorUid: "admin-uid", actorRole: "admin", testimonialId: "t-1", action: "approve" });
    expect(t.status).toBe("approved");
    expect(auditSink).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: "approve_testimonial" })
    );
  });
});
