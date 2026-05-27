import { test, expect } from "@playwright/test";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { DiscoverContentByTopicAndDatePage } from "../../../apps/web/src/features/blog-seo/discover-content-by-topic-and-date";
import type { DiscoverByTopicAndDateResult } from "../../../apps/api/src/features/blog-seo/discover-content-by-topic-and-date.types";
import type { BlogIndexEntry } from "../../../apps/api/src/features/blog-seo/schema";

const makeEntry = (slug: string, tags: string[] = ["news"]): BlogIndexEntry => ({
  postId: slug,
  slug,
  publishedAt: "2026-05-20T08:00:00.000Z",
  category: "general",
  tags
});

test("US3 e2e: filtered by tag shows only matching posts", async ({ page }) => {
  const result: DiscoverByTopicAndDateResult = {
    entries: [
      makeEntry("climate-article", ["climate"]),
      makeEntry("env-summit", ["climate", "environment"])
    ],
    appliedFilters: { tag: "climate" }
  };

  const html = renderToStaticMarkup(
    React.createElement(DiscoverContentByTopicAndDatePage, { result })
  );

  await page.setContent(html, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Discover" })).toBeVisible();
  await expect(page.getByTestId("active-filters")).toContainText("climate");
  await expect(page.getByRole("link", { name: /climate-article/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /env-summit/i })).toBeVisible();
});

test("US3 e2e: empty results show appropriate message", async ({ page }) => {
  const result: DiscoverByTopicAndDateResult = {
    entries: [],
    appliedFilters: { tag: "nonexistent-topic" }
  };

  const html = renderToStaticMarkup(
    React.createElement(DiscoverContentByTopicAndDatePage, { result })
  );

  await page.setContent(html, { waitUntil: "domcontentloaded" });

  await expect(page.getByText("No posts match the selected filters.")).toBeVisible();
});
