import { AdminAuditLogService } from "../../services/adminAuditLogService";
import {
  createAdminDashboardTelemetryEvent,
  type AdminDashboardTelemetry
} from "./secure-admin-access-and-governance.telemetry";
import type {
  AddSourceCommand,
  BlogPost,
  EditSourceCommand,
  PostMutationCommand,
  SourceConfig,
  Testimonial,
  TestimonialModerationCommand,
  ToggleSourceCommand
} from "./manage-sources-editorial-content-and-testimonials.types";

const URL_REGEX = /^https?:\/\/.+/;

export type SourceRepository = {
  add: (source: Omit<SourceConfig, "id" | "createdAt">) => Promise<SourceConfig>;
  edit: (id: string, updates: Partial<Pick<SourceConfig, "name" | "categoryHint">>) => Promise<SourceConfig>;
  toggle: (id: string, enabled: boolean) => Promise<SourceConfig>;
  list: () => Promise<SourceConfig[]>;
};

export type PostRepository = {
  upsert: (post: Partial<BlogPost> & Pick<BlogPost, "title">) => Promise<BlogPost>;
  setStatus: (id: string, status: BlogPost["status"]) => Promise<BlogPost>;
};

export type TestimonialRepository = {
  moderate: (id: string, action: "approve" | "remove") => Promise<Testimonial>;
};

export type ManageSourcesDependencies = {
  sourceRepository: SourceRepository;
  postRepository: PostRepository;
  testimonialRepository: TestimonialRepository;
  auditLog: AdminAuditLogService;
  telemetry: AdminDashboardTelemetry;
};

export class ManageSourcesEditorialContentAndTestimonialsService {
  constructor(private readonly deps: ManageSourcesDependencies) {}

  async addSource(command: AddSourceCommand): Promise<SourceConfig> {
    if (!URL_REGEX.test(command.url)) {
      throw new Error(`Invalid source URL: ${command.url}`);
    }

    const source = await this.deps.sourceRepository.add({
      name: command.name,
      type: command.type,
      url: command.url,
      enabled: false,
      categoryHint: command.categoryHint
    });

    await this.deps.auditLog.record({
      actorUid: command.actorUid,
      actorRole: command.actorRole,
      actionType: "add_source",
      targetType: "source",
      targetId: source.id,
      outcome: "success"
    });

    await this.deps.telemetry.track(
      createAdminDashboardTelemetryEvent("admin_source_added", "success", {
        actorUid: command.actorUid,
        sourceId: source.id
      })
    );

    return source;
  }

  async editSource(command: EditSourceCommand): Promise<SourceConfig> {
    const updates: Partial<Pick<SourceConfig, "name" | "categoryHint">> = {};
    if (command.name !== undefined) updates.name = command.name;
    if (command.categoryHint !== undefined) updates.categoryHint = command.categoryHint;

    const source = await this.deps.sourceRepository.edit(command.sourceId, updates);

    await this.deps.auditLog.record({
      actorUid: command.actorUid,
      actorRole: command.actorRole,
      actionType: "edit_source",
      targetType: "source",
      targetId: command.sourceId,
      outcome: "success"
    });

    return source;
  }

  async toggleSource(command: ToggleSourceCommand): Promise<SourceConfig> {
    const source = await this.deps.sourceRepository.toggle(command.sourceId, command.enabled);

    await this.deps.auditLog.record({
      actorUid: command.actorUid,
      actorRole: command.actorRole,
      actionType: command.enabled ? "enable_source" : "disable_source",
      targetType: "source",
      targetId: command.sourceId,
      outcome: "success"
    });

    return source;
  }

  async upsertPost(command: PostMutationCommand): Promise<BlogPost> {
    const post = await this.deps.postRepository.upsert({
      id: command.postId,
      title: command.title ?? "",
      content: command.content ?? "",
      tags: command.tags ?? [],
      category: command.category,
      status: command.status ?? "draft"
    });

    const actionType = command.postId ? "edit_post" : "create_post";

    await this.deps.auditLog.record({
      actorUid: command.actorUid,
      actorRole: command.actorRole,
      actionType,
      targetType: "post",
      targetId: post.id,
      outcome: "success"
    });

    return post;
  }

  async setPostStatus(
    actorUid: string,
    actorRole: string,
    postId: string,
    status: BlogPost["status"]
  ): Promise<BlogPost> {
    const post = await this.deps.postRepository.setStatus(postId, status);

    const actionType = status === "published" ? "publish_post" : "unpublish_post";

    await this.deps.auditLog.record({
      actorUid,
      actorRole,
      actionType,
      targetType: "post",
      targetId: postId,
      outcome: "success"
    });

    return post;
  }

  async moderateTestimonial(command: TestimonialModerationCommand): Promise<Testimonial> {
    const testimonial = await this.deps.testimonialRepository.moderate(
      command.testimonialId,
      command.action
    );

    const actionType = command.action === "approve" ? "approve_testimonial" : "remove_testimonial";

    await this.deps.auditLog.record({
      actorUid: command.actorUid,
      actorRole: command.actorRole,
      actionType,
      targetType: "testimonial",
      targetId: command.testimonialId,
      outcome: "success"
    });

    return testimonial;
  }
}
