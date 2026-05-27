import { describe, expect, it } from "vitest";
import { DiscoverContentByTopicAndDateService } from "../../../apps/api/src/features/blog-seo/discover-content-by-topic-and-date.service";
import { InMemoryBlogRepository } from "../../../apps/api/src/features/blog-seo/blogRepository";
import { createBlogDiscoveryAuditEvent } from "../../../apps/api/src/features/blog-seo/discover-content-by-topic-and-date.telemetry";
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

describe("US3 unit: discover content by topic and date", () => {
  it("returns all published posts when no filters applied", async () => {
    const posts = [makePost("1"), makePost("2"), makePost("3")];
    const repo = new InMemoryBlogRepository(posts);
    const service = new DiscoverContentByTopicAndDateService(repo);

    const result = await service.discover({});

    expect(result.entries.length).toBe(3);
  });

  it("filters by tag and returns only matching posts", async () => {
    const posts = [
      makePost("1", { tags: ["climate", "environment"] }),
      makePost("2", { tags: ["markets"] }),
      makePost("3", { tags: ["climate"] })
    ];
    const repo = new InMemoryBlogRepository(posts);
    const service = new DiscoverContentByTopicAndDateService(repo);

    const result = await service.discover({ tag: "climate" });

    expect(result.entries.length).toBe(2);
    expect(result.entries.every((e) => e.tags.includes("climate"))).toBe(true);
  });

  it("filters by date range", async () => {
    const posts = [
      makePost("10", { publishedAt: "2026-05-10T08:00:00.000Z" }),
      makePost("15", { publishedAt: "2026-05-15T08:00:00.000Z" }),
      makePost("25", { publishedAt: "2026-05-25T08:00:00.000Z" })
    ];
    const repo = new InMemoryBlogRepository(posts);
    const service = new DiscoverContentByTopicAndDateService(repo);

    const result = await service.discover({
      from: "2026-05-12T00:00:00.000Z",
      to: "2026-05-20T00:00:00.000Z"
    });

    expect(result.entries.length).toBe(1);
    expect(result.entries[0].slug).toBe("post-15");
  });

  it("returns empty list when no posts match filters", async () => {
    const posts = [makePost("1", { tags: ["politics"] })];
    const repo = new InMemoryBlogRepository(posts);
    const service = new DiscoverContentByTopicAndDateService(repo);

    const result = await service.discover({ tag: "climate" });

    expect(result.entries).toEqual([]);
  });

  it("audit event includes applied filter metadata", () => {
    const event = createBlogDiscoveryAuditEvent("success", {
      tag: "climate",
      category: "",
      resultCount: 3
    });
    expect(event.feature).toBe("blog-seo");
    expect(event.eventName).toBe("blog-discovery-filtered");
    expect(event.metadata.tag).toBe("climate");
  });
});
