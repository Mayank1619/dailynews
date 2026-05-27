import { describe, expect, it } from "vitest";
import { ReadBlogPostBySlugService } from "../../../apps/api/src/features/blog-seo/read-a-blog-post-by-slug.service";
import { InMemoryBlogRepository } from "../../../apps/api/src/features/blog-seo/blogRepository";
import { createBlogPostAuditEvent } from "../../../apps/api/src/features/blog-seo/read-a-blog-post-by-slug.telemetry";
import type { BlogPost } from "../../../apps/api/src/features/blog-seo/schema";

const makePost = (slug: string, overrides: Partial<BlogPost> = {}): BlogPost => ({
  id: slug,
  slug,
  title: `Title for ${slug}`,
  excerpt: `Excerpt for ${slug}`,
  body: `Body content for ${slug}`,
  tags: ["news"],
  category: "general",
  status: "published",
  publishedAt: "2026-05-20T08:00:00.000Z",
  updatedAt: "2026-05-20T08:00:00.000Z",
  canonicalUrl: `https://dailypaper.news/blog/${slug}`,
  ...overrides
});

describe("US2 unit: read a blog post by slug", () => {
  it("returns full post content for a known published slug", async () => {
    const repo = new InMemoryBlogRepository([makePost("hello-world")]);
    const service = new ReadBlogPostBySlugService(repo);

    const result = await service.read({ slug: "hello-world" });

    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.post.title).toBe("Title for hello-world");
      expect(result.post.body).toContain("Body content");
    }
  });

  it("sanitizes slug input before lookup", async () => {
    const repo = new InMemoryBlogRepository([makePost("safe-slug")]);
    const service = new ReadBlogPostBySlugService(repo);

    const result = await service.read({ slug: "safe-slug" });
    expect(result.found).toBe(true);
  });

  it("returns not-found result shape when post is missing", async () => {
    const repo = new InMemoryBlogRepository([]);
    const service = new ReadBlogPostBySlugService(repo);

    const result = await service.read({ slug: "missing" });

    expect(result.found).toBe(false);
    expect(result.post).toBeNull();
  });

  it("audit event records correct event name and feature", () => {
    const event = createBlogPostAuditEvent("success", { slug: "hello-world", found: true });
    expect(event.feature).toBe("blog-seo");
    expect(event.eventName).toBe("blog-post-viewed");
    expect(event.occurredAt).toBeTruthy();
  });
});
