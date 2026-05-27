import type { BlogIndexEntry } from "./schema";

export type DiscoverByTopicAndDateQuery = {
  tag?: string;
  category?: string;
  from?: string;
  to?: string;
};

export type DiscoverByTopicAndDateResult = {
  entries: BlogIndexEntry[];
  appliedFilters: {
    tag?: string;
    category?: string;
    from?: string;
    to?: string;
  };
};
