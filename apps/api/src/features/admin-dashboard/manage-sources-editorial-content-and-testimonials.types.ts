export type SourceType = "rss" | "api" | "scraper";
export type SourceStatus = "enabled" | "disabled";

export type SourceConfig = {
  id: string;
  name: string;
  type: SourceType;
  url: string;
  enabled: boolean;
  categoryHint?: string;
  createdAt: string;
};

export type AddSourceCommand = {
  actorUid: string;
  actorRole: string;
  name: string;
  type: SourceType;
  url: string;
  categoryHint?: string;
};

export type EditSourceCommand = {
  actorUid: string;
  actorRole: string;
  sourceId: string;
  name?: string;
  categoryHint?: string;
};

export type ToggleSourceCommand = {
  actorUid: string;
  actorRole: string;
  sourceId: string;
  enabled: boolean;
};

export type PostStatus = "draft" | "published" | "unpublished";

export type BlogPost = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category?: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

export type PostMutationCommand = {
  actorUid: string;
  actorRole: string;
  postId?: string;
  title?: string;
  content?: string;
  tags?: string[];
  category?: string;
  status?: PostStatus;
};

export type TestimonialStatus = "pending" | "approved" | "removed";

export type Testimonial = {
  id: string;
  authorName: string;
  content: string;
  status: TestimonialStatus;
  createdAt: string;
};

export type TestimonialModerationCommand = {
  actorUid: string;
  actorRole: string;
  testimonialId: string;
  action: "approve" | "remove";
};
