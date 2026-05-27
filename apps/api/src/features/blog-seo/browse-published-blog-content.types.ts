import type { BlogIndexEntry } from "./schema";

export type BrowsePublishedBlogContentQuery = {
  limit?: number;
  offset?: number;
};

export type BrowsePublishedBlogContentResult = {
  entries: BlogIndexEntry[];
  total: number;
  hasMore: boolean;
  currentPage: number;
  pageSize: number;
};
