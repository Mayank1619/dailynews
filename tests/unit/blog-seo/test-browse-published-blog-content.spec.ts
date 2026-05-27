import { describe, expect, it } from "vitest";
import { BrowsePublishedBlogContentService } from "../../../apps/api/src/features/blog-seo/browse-published-blog-content.service";
import { InMemoryBlogRepository } from "../../../apps/api/src/features/blog-seo/blogRepository";
import { createBlogBrowseAuditEvent } from "../../../apps/api/src/features/blog-seo/browse-published-blog-content.telemetry";
import type { BlogPost } from "../../../apps/api/src/features/blog-seo/schema";

const makePost = (id: string, overrides: Partial<BlogPost> = {}): BlogPost => ({
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

describe("US1 unit: browse published blog content", () => {
  it("returns published posts sorted by date descending", async () => {
    const posts = [makePost("1"), makePost("3"), makePost("2")];
    const repo = new InMemoryBlogRepository(posts);
    const service = new BrowsePublishedBlogContentService(repo);

    const result = await service.browse();

    expect(result.entries[0].slug).toBe("post-3");
    expect(result.entries[1].slug).toBe("post-2");
    expect(result.entries[2].slug).toBe("post-1");
  });

  it("paginates correctly with limit and offset", async () => {
    const posts = Array.from({ length: 5 }, (_, i) => makePost(String(i + 1)));
    const repo = new InMemoryBlogRepository(posts);
    const service = new BrowsePublishedBlogContentService(repo);

    const page1 = await service.browse({ limit: 2, offset: 0 });
    const page2 = await service.browse({ limit: 2, offset: 2 });

    expect(page1.entries.length).toBe(2);
    expect(page1.hasMore).toBe(true);
    expect(page2.entries.length).toBe(2);
    expect(page2.currentPage).toBe(2);
  });

  it("result is empty when no published posts exist", async () => {
    const repo = new InMemoryBlogRepository([]);
    const service = new BrowsePublishedBlogContentService(repo);

    const result = await service.browse();

    expect(result.entries).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.hasMore).toBe(false);
  });

  it("audit event has correct feature and eventName", () => {
    const event = createBlogBrowseAuditEvent("success", { route: "/blog", total: 5 });
    expect(event.feature).toBe("blog-seo");
    expect(event.eventName).toBe("blog-index-browsed");
    expect(event.status).toBe("success");
    expect(event.occurredAt).toBeTruthy();
  });
});
