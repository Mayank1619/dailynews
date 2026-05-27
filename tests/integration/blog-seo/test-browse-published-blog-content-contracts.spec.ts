import { describe, expect, it } from "vitest";
import { BrowsePublishedBlogContentService } from "../../../apps/api/src/features/blog-seo/browse-published-blog-content.service";
import { InMemoryBlogRepository } from "../../../apps/api/src/features/blog-seo/blogRepository";
import type { BlogPost } from "../../../apps/api/src/features/blog-seo/schema";
import { BLOG_BASE_ROUTE, DEFAULT_PAGE_SIZE } from "../../../apps/web/src/features/blog-seo/contracts";

const makePost = (
  id: string,
  overrides: Partial<BlogPost> = {}
): BlogPost => ({
  id,
  slug: `post-${id}`,
  title: `Post ${id}`,
  excerpt: `Excerpt for post ${id}`,
  body: `Body content for post ${id}`,
  tags: ["news"],
  category: "general",
  status: "published",
  publishedAt: `2026-05-${id.padStart(2, "0")}T08:00:00.000Z`,
  updatedAt: `2026-05-${id.padStart(2, "0")}T08:00:00.000Z`,
  canonicalUrl: `https://dailypaper.news/blog/post-${id}`,
  ...overrides
});

describe("US1 integration: browse published blog content contracts", () => {
  it("returns only published posts and respects pagination contracts", async () => {
    const posts = [
      makePost("1"),
      makePost("2"),
      makePost("3", { status: "draft" })
    ];
    const repo = new InMemoryBlogRepository(posts);
    const service = new BrowsePublishedBlogContentService(repo);

    const result = await service.browse({ limit: DEFAULT_PAGE_SIZE });

    expect(result.entries.length).toBe(2);
    expect(result.total).toBe(2);
    expect(result.hasMore).toBe(false);
    expect(result.currentPage).toBe(1);
  });

  it("blog base route is /blog", () => {
    expect(BLOG_BASE_ROUTE).toBe("/blog");
  });

  it("excludes draft posts from public index", async () => {
    const posts = [makePost("1", { status: "draft" }), makePost("2", { status: "draft" })];
    const repo = new InMemoryBlogRepository(posts);
    const service = new BrowsePublishedBlogContentService(repo);

    const result = await service.browse();

    expect(result.entries.length).toBe(0);
    expect(result.total).toBe(0);
  });
});
