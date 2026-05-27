export const BLOG_BASE_ROUTE = "/blog";
export const BLOG_POST_ROUTE = (slug: string) => `/blog/${slug}`;
export const BLOG_SITEMAP_ROUTE = "/sitemap.xml";
export const BLOG_RSS_ROUTE = "/feed.xml";

export type BlogRouteAction = {
  id: string;
  label: string;
  route: string;
};

export const BLOG_NAV_ACTIONS: BlogRouteAction[] = [
  { id: "blog-index", label: "Blog", route: BLOG_BASE_ROUTE },
  { id: "blog-sitemap", label: "Sitemap", route: BLOG_SITEMAP_ROUTE }
];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
