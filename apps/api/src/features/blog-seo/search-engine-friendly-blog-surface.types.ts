import type { BlogPost, SeoMetadata } from "./schema";

export type SitemapEntry = {
  loc: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
};

export type RssFeedItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
};

export type BuildSitemapEntriesResult = {
  entries: SitemapEntry[];
};

export type BuildRssFeedResult = {
  items: RssFeedItem[];
};

export type GenerateSeoMetadataOptions = {
  post: BlogPost;
  baseUrl: string;
};

export type GenerateBlogIndexSeoOptions = {
  baseUrl: string;
  pageNumber?: number;
};
