import { describe, expect, it } from "vitest";
import { DiscoverContentByTopicAndDateService } from "../../../apps/api/src/features/blog-seo/discover-content-by-topic-and-date.service";
import { InMemoryBlogRepository } from "../../../apps/api/src/features/blog-seo/blogRepository";
import { BLOG_BASE_ROUTE } from "../../../apps/web/src/features/blog-seo/contracts";
import type { BlogPost } from "../../../apps/api/src/features/blog-seo/schema";

const makePost = (
  id: string,
  overrides: Partial<BlogPost> = {}
): BlogPost => ({
  id,
  slug: `post-${id}`,
  title: `Post ${id}`,
  excerpt: `Excerpt ${id}`,
  body: `Body ${id}`,
  tags: ["news"],
  category: "general",
  status: "published",
  publishedAt: `2026-05-${id.padStart(2, "0")}T08:00:00.000Z`,
  updatedAt: `2026-05-${id.padStart(2, "0")}T08:00:00.000Z`,
  canonicalUrl: `https://dailypaper.news/blog/post-${id}`,
  ...overrides
});

describe("US3 integration: discover content by topic and date contracts", () => {
  it("filters posts by tag via contract boundary", async () => {
    const posts = [
      makePost("1", { tags: ["climate"] }),
      makePost("2", { tags: ["markets"] }),
      makePost("3", { tags: ["climate"] })
    ];
    const repo = new InMemoryBlogRepository(posts);
    const service = new DiscoverContentByTopicAndDateService(repo);

    const result = await service.discover({ tag: "climate" });

    expect(result.entries.length).toBe(2);
    expect(result.appliedFilters.tag).toBe("climate");
  });

  it("filters posts by category", async () => {
    const posts = [
      makePost("1", { category: "tech" }),
      makePost("2", { category: "politics" }),
      makePost("3", { category: "tech" })
    ];
    const repo = new InMemoryBlogRepository(posts);
    const service = new DiscoverContentByTopicAndDateService(repo);

    const result = await service.discover({ category: "tech" });

    expect(result.entries.length).toBe(2);
    expect(result.appliedFilters.category).toBe("tech");
  });

  it("blog base route resolves to /blog for discovery navigation", () => {
    expect(BLOG_BASE_ROUTE).toBe("/blog");
  });
});
