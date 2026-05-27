import type {
  SitemapEntry,
  RssFeedItem,
  GenerateSeoMetadataOptions,
  GenerateBlogIndexSeoOptions,
  BuildSitemapEntriesResult,
  BuildRssFeedResult
} from "./search-engine-friendly-blog-surface.types";
import type { SeoMetadata } from "./schema";
import type { IBlogRepository } from "./blogRepository";

export class SearchEngineFriendlyBlogSurfaceService {
  constructor(private readonly repository: IBlogRepository) {}

  generatePostSeoMetadata(options: GenerateSeoMetadataOptions): SeoMetadata {
    const { post, baseUrl } = options;
    const canonicalUrl = `${baseUrl}/blog/${post.slug}`;
    return {
      route: `/blog/${post.slug}`,
      title: `${post.title} | Daily Paper Blog`,
      description: post.excerpt.slice(0, 160),
      canonicalUrl,
      ogImage: `${baseUrl}/social-preview.png`,
      robots: "index, follow"
    };
  }

  generateBlogIndexSeoMetadata(
    options: GenerateBlogIndexSeoOptions
  ): SeoMetadata {
    const { baseUrl, pageNumber = 1 } = options;
    const route = pageNumber === 1 ? "/blog" : `/blog?page=${pageNumber}`;
    return {
      route,
      title: "Blog | Daily Paper",
      description: "Browse all Daily Paper articles covering news, analysis, and insights.",
      canonicalUrl: pageNumber === 1 ? `${baseUrl}/blog` : `${baseUrl}/blog?page=${pageNumber}`,
      ogImage: `${baseUrl}/social-preview.png`,
      robots: pageNumber === 1 ? "index, follow" : "noindex, follow"
    };
  }

  async buildSitemapEntries(
    baseUrl: string
  ): Promise<BuildSitemapEntriesResult> {
    const posts = await this.repository.getPublishedPosts(1000, 0);
    const entries: SitemapEntry[] = [
      {
        loc: `${baseUrl}/blog`,
        lastmod: new Date().toISOString().split("T")[0],
        changefreq: "daily",
        priority: 0.8
      },
      ...posts.map((entry) => ({
        loc: `${baseUrl}/blog/${entry.slug}`,
        lastmod: entry.publishedAt.split("T")[0],
        changefreq: "weekly" as const,
        priority: 0.6
      }))
    ];
    return { entries };
  }

  async buildRssFeed(baseUrl: string): Promise<BuildRssFeedResult> {
    const posts = await this.repository.getPublishedPosts(20, 0);
    const items: RssFeedItem[] = posts.map((entry) => ({
      title: entry.slug,
      link: `${baseUrl}/blog/${entry.slug}`,
      description: `Read the full article at ${baseUrl}/blog/${entry.slug}`,
      pubDate: new Date(entry.publishedAt).toUTCString(),
      guid: `${baseUrl}/blog/${entry.slug}`
    }));
    return { items };
  }
}
