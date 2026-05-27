import { test, expect } from "@playwright/test";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { BlogSeoHead } from "../../../apps/web/src/features/blog-seo/search-engine-friendly-blog-surface";
import type { SeoMetadata } from "../../../apps/api/src/features/blog-seo/schema";

const makeSeo = (overrides: Partial<SeoMetadata> = {}): SeoMetadata => ({
  route: "/blog/test-post",
  title: "Test Post | Daily Paper Blog",
  description: "A description of the test post for SEO purposes.",
  canonicalUrl: "https://dailypaper.news/blog/test-post",
  ogImage: "https://dailypaper.news/social-preview.png",
  robots: "index, follow",
  ...overrides
});

test("US4 e2e: SEO head renders canonical URL and OG metadata", async ({
  page
}) => {
  const seo = makeSeo();
  const html = `<!doctype html><html>${renderToStaticMarkup(
    React.createElement(BlogSeoHead, { seo })
  )}<body><p>content</p></body></html>`;

  await page.setContent(html, { waitUntil: "domcontentloaded" });

  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute(
    "href",
    "https://dailypaper.news/blog/test-post"
  );

  const ogTitle = page.locator('meta[property="og:title"]');
  await expect(ogTitle).toHaveAttribute("content", "Test Post | Daily Paper Blog");

  const robotsMeta = page.locator('meta[name="robots"]');
  await expect(robotsMeta).toHaveAttribute("content", "index, follow");
});

test("US4 e2e: paginated blog index uses noindex robots directive", async ({
  page
}) => {
  const seo = makeSeo({
    route: "/blog?page=2",
    title: "Blog | Daily Paper",
    canonicalUrl: "https://dailypaper.news/blog?page=2",
    robots: "noindex, follow"
  });
  const html = `<!doctype html><html>${renderToStaticMarkup(
    React.createElement(BlogSeoHead, { seo })
  )}<body></body></html>`;

  await page.setContent(html, { waitUntil: "domcontentloaded" });

  const robotsMeta = page.locator('meta[name="robots"]');
  await expect(robotsMeta).toHaveAttribute("content", "noindex, follow");
});
