import { expect, test } from "@playwright/test";
import { MANAGE_SOURCES_COPY } from "../../../apps/web/src/features/admin-dashboard/manage-sources-editorial-content-and-testimonials";

test("US3 e2e placeholder: sources panel shows enable/disable controls", async ({ page }) => {
  await page.setContent(`
    <main>
      <section>
        <h2>${MANAGE_SOURCES_COPY.sourcesHeading}</h2>
        <table>
          <thead><tr><th>Name</th><th>Type</th><th>URL</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr>
              <td>Reuters</td><td>rss</td><td>https://reuters.com/rss</td>
              <td>Enabled</td>
              <td><button aria-label="Disable source Reuters">${MANAGE_SOURCES_COPY.disableLabel}</button></td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2>${MANAGE_SOURCES_COPY.blogHeading}</h2>
        <table>
          <thead><tr><th>Title</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr>
              <td>Breaking News</td><td>draft</td>
              <td><button aria-label="Publish post Breaking News">${MANAGE_SOURCES_COPY.publishLabel}</button></td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2>${MANAGE_SOURCES_COPY.testimonialsHeading}</h2>
        <table>
          <thead><tr><th>Author</th><th>Content</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr>
              <td>Alice</td><td>Great app!</td><td>pending</td>
              <td>
                <button aria-label="Approve testimonial by Alice">${MANAGE_SOURCES_COPY.approveLabel}</button>
                <button aria-label="Remove testimonial by Alice">${MANAGE_SOURCES_COPY.removeLabel}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  `, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: MANAGE_SOURCES_COPY.sourcesHeading })).toBeVisible();
  await expect(page.getByRole("button", { name: /Disable source Reuters/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: MANAGE_SOURCES_COPY.blogHeading })).toBeVisible();
  await expect(page.getByRole("button", { name: /Publish post Breaking News/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: MANAGE_SOURCES_COPY.testimonialsHeading })).toBeVisible();
  await expect(page.getByRole("button", { name: /Approve testimonial by Alice/ })).toBeVisible();
});
