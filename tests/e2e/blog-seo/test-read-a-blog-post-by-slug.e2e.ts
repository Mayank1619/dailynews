import { test, expect } from "@playwright/test";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { ReadBlogPostBySlugPage } from "../../../apps/web/src/features/blog-seo/read-a-blog-post-by-slug";
import type { BlogPost } from "../../../apps/api/src/features/blog-seo/schema";

const makePost = (slug: string): BlogPost => ({
  id: slug,
  slug,
  title: `Understanding ${slug}`,
  excerpt: `A brief summary of the ${slug} article`,
  body: `Full article body for ${slug}. Lorem ipsum dolor sit amet.`,
  tags: ["news", "analysis"],
  category: "insights",
  status: "published",
  publishedAt: "2026-05-20T08:00:00.000Z",
  updatedAt: "2026-05-20T08:00:00.000Z",
  canonicalUrl: `https://dailypaper.news/blog/${slug}`
});

test("US2 e2e: blog post page renders full content and metadata", async ({
  page
}) => {
  const post = makePost("global-markets-analysis");
  const html = renderToStaticMarkup(
    React.createElement(ReadBlogPostBySlugPage, { post, slug: post.slug })
  );

  await page.setContent(html, { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { name: /Understanding global-markets-analysis/i })
  ).toBeVisible();
  await expect(page.getByTestId("excerpt")).toBeVisible();
  await expect(page.getByTestId("body")).toBeVisible();
  await expect(page.getByRole("link", { name: "news" })).toBeVisible();
});

test("US2 e2e: unknown slug shows not-found message and back link", async ({
  page
}) => {
  const html = renderToStaticMarkup(
    React.createElement(ReadBlogPostBySlugPage, { post: null, slug: "unknown" })
  );

  await page.setContent(html, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Post not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to blog" })).toBeVisible();
});
