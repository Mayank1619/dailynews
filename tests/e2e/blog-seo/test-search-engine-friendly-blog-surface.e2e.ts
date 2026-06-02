import { expect, test } from "@playwright/test";

function seoHead({
  title,
  canonicalUrl,
  robots
}: {
  title: string;
  canonicalUrl: string;
  robots: string;
}): string {
  return `<!doctype html>
  <html>
    <head>
      <title>${title}</title>
      <meta name="description" content="A description of the test post for SEO purposes." />
      <link rel="canonical" href="${canonicalUrl}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="A description of the test post for SEO purposes." />
      <meta property="og:url" content="${canonicalUrl}" />
      <meta property="og:image" content="https://dailypaper.news/social-preview.png" />
      <meta name="robots" content="${robots}" />
    </head>
    <body><p>content</p></body>
  </html>`;
}

test("US4 e2e: SEO head renders canonical URL and OG metadata", async ({ page }) => {
  await page.setContent(
    seoHead({
      title: "Test Post | Daily Paper Blog",
      canonicalUrl: "https://dailypaper.news/blog/test-post",
      robots: "index, follow"
    }),
    { waitUntil: "domcontentloaded" }
  );

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://dailypaper.news/blog/test-post"
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Test Post | Daily Paper Blog");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
});

test("US4 e2e: paginated blog index uses noindex robots directive", async ({ page }) => {
  await page.setContent(
    seoHead({
      title: "Blog | Daily Paper",
      canonicalUrl: "https://dailypaper.news/blog?page=2",
      robots: "noindex, follow"
    }),
    { waitUntil: "domcontentloaded" }
  );

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
});
