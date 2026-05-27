import type { BlogPost, BlogIndexEntry } from "./schema";

export interface IBlogRepository {
  getPublishedPosts(limit?: number, offset?: number): Promise<BlogIndexEntry[]>;
  getPostBySlug(slug: string): Promise<BlogPost | null>;
  getPostsByCategory(category: string): Promise<BlogIndexEntry[]>;
  getPostsByTag(tag: string): Promise<BlogIndexEntry[]>;
  getPostsByDateRange(from: string, to: string): Promise<BlogIndexEntry[]>;
  countPublishedPosts(): Promise<number>;
}

export class InMemoryBlogRepository implements IBlogRepository {
  private posts: BlogPost[];

  constructor(posts: BlogPost[] = []) {
    this.posts = posts;
  }

  async getPublishedPosts(limit = 20, offset = 0): Promise<BlogIndexEntry[]> {
    return this.posts
      .filter((p) => p.status === "published")
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(offset, offset + limit)
      .map((p) => ({
        postId: p.id,
        slug: p.slug,
        publishedAt: p.publishedAt,
        category: p.category,
        tags: p.tags
      }));
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const post = this.posts.find(
      (p) => p.slug === slug && p.status === "published"
    );
    return post ?? null;
  }

  async getPostsByCategory(category: string): Promise<BlogIndexEntry[]> {
    return this.posts
      .filter((p) => p.status === "published" && p.category === category)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .map((p) => ({
        postId: p.id,
        slug: p.slug,
        publishedAt: p.publishedAt,
        category: p.category,
        tags: p.tags
      }));
  }

  async getPostsByTag(tag: string): Promise<BlogIndexEntry[]> {
    return this.posts
      .filter((p) => p.status === "published" && p.tags.includes(tag))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .map((p) => ({
        postId: p.id,
        slug: p.slug,
        publishedAt: p.publishedAt,
        category: p.category,
        tags: p.tags
      }));
  }

  async getPostsByDateRange(
    from: string,
    to: string
  ): Promise<BlogIndexEntry[]> {
    return this.posts
      .filter(
        (p) =>
          p.status === "published" &&
          p.publishedAt >= from &&
          p.publishedAt <= to
      )
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .map((p) => ({
        postId: p.id,
        slug: p.slug,
        publishedAt: p.publishedAt,
        category: p.category,
        tags: p.tags
      }));
  }

  async countPublishedPosts(): Promise<number> {
    return this.posts.filter((p) => p.status === "published").length;
  }
}
