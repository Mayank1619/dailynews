import type { BlogPost } from "./schema";

export type ReadBlogPostBySlugQuery = {
  slug: string;
};

export type ReadBlogPostBySlugResult =
  | { found: true; post: BlogPost }
  | { found: false; post: null };
