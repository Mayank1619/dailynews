import type {
  DiscoverByTopicAndDateQuery,
  DiscoverByTopicAndDateResult
} from "./discover-content-by-topic-and-date.types";
import type { IBlogRepository } from "./blogRepository";
import type { BlogIndexEntry } from "./schema";

export class DiscoverContentByTopicAndDateService {
  constructor(private readonly repository: IBlogRepository) {}

  async discover(
    query: DiscoverByTopicAndDateQuery
  ): Promise<DiscoverByTopicAndDateResult> {
    let entries: BlogIndexEntry[] = [];

    if (query.tag) {
      entries = await this.repository.getPostsByTag(query.tag);
    } else if (query.category) {
      entries = await this.repository.getPostsByCategory(query.category);
    } else if (query.from || query.to) {
      const from = query.from ?? "0000-01-01T00:00:00.000Z";
      const to = query.to ?? new Date().toISOString();
      entries = await this.repository.getPostsByDateRange(from, to);
    } else {
      entries = await this.repository.getPublishedPosts(100, 0);
    }

    if (query.category && query.tag) {
      entries = entries.filter((e) => e.tags.includes(query.tag!));
    }

    return {
      entries,
      appliedFilters: {
        tag: query.tag,
        category: query.category,
        from: query.from,
        to: query.to
      }
    };
  }
}
