import { test, expect } from "@playwright/test";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { BrowsePublishedBlogContentPage } from "../../../apps/web/src/features/blog-seo/browse-published-blog-content";
import type { BlogIndexEntry } from "../../../apps/api/src/features/blog-seo/schema";

const makeEntry = (slug: string): BlogIndexEntry => ({
  postId: slug,
  slug,
  publishedAt: "2026-05-20T08:00:00.000Z",
  category: "news",
  tags: ["daily"]
});

test("US1 e2e: blog index renders published post cards and pagination", async ({
  page
}) => {
  const result = {
    entries: [makeEntry("intro-to-daily-paper"), makeEntry("market-update-may")],
    total: 5,
    hasMore: true,
    currentPage: 1,
    pageSize: 2
  };

  const html = renderToStaticMarkup(
    React.createElement(BrowsePublishedBlogContentPage, { result })
  );

  await page.setContent(html, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  await expect(page.getByRole("link", { name: /intro-to-daily-paper/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /market-update-may/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Next page/i })).toBeVisible();
});
