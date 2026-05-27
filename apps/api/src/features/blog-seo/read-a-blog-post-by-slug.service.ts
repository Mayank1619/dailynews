import type {
  ReadBlogPostBySlugQuery,
  ReadBlogPostBySlugResult
} from "./read-a-blog-post-by-slug.types";
import type { IBlogRepository } from "./blogRepository";

export class ReadBlogPostBySlugService {
  constructor(private readonly repository: IBlogRepository) {}

  async read(query: ReadBlogPostBySlugQuery): Promise<ReadBlogPostBySlugResult> {
    const sanitizedSlug = query.slug.replace(/[^a-z0-9-]/gi, "").toLowerCase();
    const post = await this.repository.getPostBySlug(sanitizedSlug);
    if (!post) {
      return { found: false, post: null };
    }
    return { found: true, post };
  }
}
