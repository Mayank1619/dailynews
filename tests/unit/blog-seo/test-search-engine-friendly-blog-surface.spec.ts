import { describe, expect, it } from "vitest";
import { SearchEngineFriendlyBlogSurfaceService } from "../../../apps/api/src/features/blog-seo/search-engine-friendly-blog-surface.service";
import { InMemoryBlogRepository } from "../../../apps/api/src/features/blog-seo/blogRepository";
import { createSeoAuditEvent } from "../../../apps/api/src/features/blog-seo/search-engine-friendly-blog-surface.telemetry";
import { validateSeoMetadata } from "../../../apps/api/src/features/blog-seo/schema";
import type { BlogPost } from "../../../apps/api/src/features/blog-seo/schema";

const BASE_URL = "https://dailypaper.news";

const makePost = (slug: string, overrides: Partial<BlogPost> = {}): BlogPost => ({
  id: slug,
  slug,
  title: `Title for ${slug}`,
  excerpt: `Excerpt for ${slug}`,
  body: `Body for ${slug}`,
  tags: ["seo"],
  category: "news",
  status: "published",
  publishedAt: "2026-05-20T08:00:00.000Z",
  updatedAt: "2026-05-20T08:00:00.000Z",
  canonicalUrl: `${BASE_URL}/blog/${slug}`,
  ...overrides
});

describe("US4 unit: search engine friendly blog surface", () => {
  it("generates SEO metadata with canonical URL for a post", () => {
    const repo = new InMemoryBlogRepository([]);
    const service = new SearchEngineFriendlyBlogSurfaceService(repo);

    const seo = service.generatePostSeoMetadata({
      post: makePost("hello-world"),
      baseUrl: BASE_URL
    });

    expect(seo.title.toLowerCase()).toContain("hello-world");
    expect(seo.canonicalUrl).toBe(`${BASE_URL}/blog/hello-world`);
    expect(seo.description.length).toBeLessThanOrEqual(160);
    expect(validateSeoMetadata(seo)).toBe(true);
  });

  it("blog index SEO is indexable on page 1 and noindex on subsequent pages", () => {
    const repo = new InMemoryBlogRepository([]);
    const service = new SearchEngineFriendlyBlogSurfaceService(repo);

    const page1 = service.generateBlogIndexSeoMetadata({ baseUrl: BASE_URL, pageNumber: 1 });
    const page2 = service.generateBlogIndexSeoMetadata({ baseUrl: BASE_URL, pageNumber: 2 });

    expect(page1.robots).toBe("index, follow");
    expect(page2.robots).toBe("noindex, follow");
  });

  it("sitemap entries have correct structure and priority", async () => {
    const posts = [makePost("post-a"), makePost("post-b")];
    const repo = new InMemoryBlogRepository(posts);
    const service = new SearchEngineFriendlyBlogSurfaceService(repo);

    const { entries } = await service.buildSitemapEntries(BASE_URL);

    expect(entries.length).toBeGreaterThanOrEqual(3);
    const blogIndex = entries.find((e) => e.loc === `${BASE_URL}/blog`);
    expect(blogIndex?.priority).toBe(0.8);
    expect(blogIndex?.changefreq).toBe("daily");
  });

  it("RSS feed items link to correct post URLs", async () => {
    const posts = [makePost("latest-post")];
    const repo = new InMemoryBlogRepository(posts);
    const service = new SearchEngineFriendlyBlogSurfaceService(repo);

    const feed = await service.buildRssFeed(BASE_URL);

    expect(feed.items.length).toBe(1);
    expect(feed.items[0].link).toBe(`${BASE_URL}/blog/latest-post`);
    expect(feed.items[0].guid).toBe(`${BASE_URL}/blog/latest-post`);
  });

  it("SEO audit event records correct feature and event name", () => {
    const event = createSeoAuditEvent("seo-metadata-generated", "success", {
      route: "/blog/hello-world",
      canonicalUrl: `${BASE_URL}/blog/hello-world`
    });
    expect(event.feature).toBe("blog-seo");
    expect(event.eventName).toBe("seo-metadata-generated");
    expect(event.status).toBe("success");
  });
});
