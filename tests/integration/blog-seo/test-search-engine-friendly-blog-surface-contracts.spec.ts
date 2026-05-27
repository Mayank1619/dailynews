import { describe, expect, it } from "vitest";
import { SearchEngineFriendlyBlogSurfaceService } from "../../../apps/api/src/features/blog-seo/search-engine-friendly-blog-surface.service";
import { InMemoryBlogRepository } from "../../../apps/api/src/features/blog-seo/blogRepository";
import { validateSeoMetadata } from "../../../apps/api/src/features/blog-seo/schema";
import {
  BLOG_BASE_ROUTE,
  BLOG_SITEMAP_ROUTE
} from "../../../apps/web/src/features/blog-seo/contracts";
import type { BlogPost } from "../../../apps/api/src/features/blog-seo/schema";

const BASE_URL = "https://dailypaper.news";

const makePost = (slug: string, overrides: Partial<BlogPost> = {}): BlogPost => ({
  id: slug,
  slug,
  title: `Title for ${slug}`,
  excerpt: `Excerpt for ${slug} that's long enough to use as a description`,
  body: `Body for ${slug}`,
  tags: ["seo"],
  category: "news",
  status: "published",
  publishedAt: "2026-05-20T08:00:00.000Z",
  updatedAt: "2026-05-20T08:00:00.000Z",
  canonicalUrl: `${BASE_URL}/blog/${slug}`,
  ...overrides
});

describe("US4 integration: search engine friendly blog surface contracts", () => {
  it("generated post SEO metadata passes schema validation", () => {
    const repo = new InMemoryBlogRepository([]);
    const service = new SearchEngineFriendlyBlogSurfaceService(repo);

    const seo = service.generatePostSeoMetadata({
      post: makePost("my-post"),
      baseUrl: BASE_URL
    });

    expect(validateSeoMetadata(seo)).toBe(true);
    expect(seo.canonicalUrl).toBe(`${BASE_URL}/blog/my-post`);
    expect(seo.robots).toBe("index, follow");
  });

  it("sitemap includes /blog index and entries for all published posts", async () => {
    const posts = [makePost("alpha"), makePost("beta")];
    const repo = new InMemoryBlogRepository(posts);
    const service = new SearchEngineFriendlyBlogSurfaceService(repo);

    const sitemap = await service.buildSitemapEntries(BASE_URL);

    const locs = sitemap.entries.map((e) => e.loc);
    expect(locs).toContain(`${BASE_URL}/blog`);
    expect(locs).toContain(`${BASE_URL}/blog/alpha`);
    expect(locs).toContain(`${BASE_URL}/blog/beta`);
  });

  it("sitemap route contract matches /sitemap.xml", () => {
    expect(BLOG_SITEMAP_ROUTE).toBe("/sitemap.xml");
  });

  it("blog index route contract matches /blog", () => {
    expect(BLOG_BASE_ROUTE).toBe("/blog");
  });

  it("draft posts are not included in sitemap", async () => {
    const posts = [
      makePost("visible"),
      makePost("hidden", { status: "draft" })
    ];
    const repo = new InMemoryBlogRepository(posts);
    const service = new SearchEngineFriendlyBlogSurfaceService(repo);

    const sitemap = await service.buildSitemapEntries(BASE_URL);

    const locs = sitemap.entries.map((e) => e.loc);
    expect(locs).toContain(`${BASE_URL}/blog/visible`);
    expect(locs).not.toContain(`${BASE_URL}/blog/hidden`);
  });
});
