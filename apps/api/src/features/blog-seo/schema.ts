export type BlogPostStatus = "draft" | "published";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  category: string;
  status: BlogPostStatus;
  publishedAt: string;
  updatedAt: string;
  canonicalUrl: string;
};

export type BlogIndexEntry = {
  postId: string;
  slug: string;
  publishedAt: string;
  category: string;
  tags: string[];
};

export type SeoMetadata = {
  route: string;
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
  robots: string;
};

export function validateBlogPost(data: unknown): data is BlogPost {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.id === "string" &&
    typeof d.slug === "string" &&
    d.slug.length > 0 &&
    typeof d.title === "string" &&
    typeof d.excerpt === "string" &&
    typeof d.body === "string" &&
    Array.isArray(d.tags) &&
    (d.tags as unknown[]).every((t) => typeof t === "string") &&
    typeof d.category === "string" &&
    (d.status === "draft" || d.status === "published") &&
    typeof d.publishedAt === "string" &&
    typeof d.updatedAt === "string" &&
    typeof d.canonicalUrl === "string"
  );
}

export function validateBlogIndexEntry(data: unknown): data is BlogIndexEntry {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.postId === "string" &&
    typeof d.slug === "string" &&
    d.slug.length > 0 &&
    typeof d.publishedAt === "string" &&
    typeof d.category === "string" &&
    Array.isArray(d.tags) &&
    (d.tags as unknown[]).every((t) => typeof t === "string")
  );
}

export function validateSeoMetadata(data: unknown): data is SeoMetadata {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.route === "string" &&
    typeof d.title === "string" &&
    typeof d.description === "string" &&
    typeof d.canonicalUrl === "string" &&
    typeof d.ogImage === "string" &&
    typeof d.robots === "string"
  );
}
