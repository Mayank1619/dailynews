import { describe, expect, it } from "vitest";
import { ReadBlogPostBySlugService } from "../../../apps/api/src/features/blog-seo/read-a-blog-post-by-slug.service";
import { InMemoryBlogRepository } from "../../../apps/api/src/features/blog-seo/blogRepository";
import { BLOG_POST_ROUTE } from "../../../apps/web/src/features/blog-seo/contracts";
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

describe("US2 integration: read a blog post by slug contracts", () => {
  it("resolves a published post by slug", async () => {
    const repo = new InMemoryBlogRepository([makePost("my-first-post")]);
    const service = new ReadBlogPostBySlugService(repo);

    const result = await service.read({ slug: "my-first-post" });

    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.post.slug).toBe("my-first-post");
      expect(result.post.canonicalUrl).toBe(
        "https://dailypaper.news/blog/my-first-post"
      );
    }
  });

  it("returns not found for unknown slug", async () => {
    const repo = new InMemoryBlogRepository([]);
    const service = new ReadBlogPostBySlugService(repo);

    const result = await service.read({ slug: "unknown-slug" });

    expect(result.found).toBe(false);
  });

  it("blog post route helper produces correct path", () => {
    expect(BLOG_POST_ROUTE("my-slug")).toBe("/blog/my-slug");
  });

  it("does not expose draft posts via slug", async () => {
    const repo = new InMemoryBlogRepository([
      makePost("draft-post", { status: "draft" })
    ]);
    const service = new ReadBlogPostBySlugService(repo);

    const result = await service.read({ slug: "draft-post" });

    expect(result.found).toBe(false);
  });
});
