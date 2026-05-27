import type {
  BrowsePublishedBlogContentQuery,
  BrowsePublishedBlogContentResult
} from "./browse-published-blog-content.types";
import type { IBlogRepository } from "./blogRepository";

export class BrowsePublishedBlogContentService {
  constructor(private readonly repository: IBlogRepository) {}

  async browse(
    query: BrowsePublishedBlogContentQuery = {}
  ): Promise<BrowsePublishedBlogContentResult> {
    const pageSize = Math.min(Math.max(query.limit ?? 20, 1), 100);
    const offset = Math.max(query.offset ?? 0, 0);

    const [entries, total] = await Promise.all([
      this.repository.getPublishedPosts(pageSize, offset),
      this.repository.countPublishedPosts()
    ]);

    return {
      entries,
      total,
      hasMore: offset + entries.length < total,
      currentPage: Math.floor(offset / pageSize) + 1,
      pageSize
    };
  }
}
