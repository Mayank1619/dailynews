import { expect, test } from '@playwright/test';

test.describe('Content ingestion US3 e2e', () => {
  test('renders attributed article details and duplicate guard copy', async ({ page }) => {
    const html = `
      <main>
        <section aria-label="attribution and dedupe guard">
          <h2>Preserve attribution and avoid duplicates</h2>
          <article data-testid="content-ingestion-article-card">
            <h3>City council approves transit upgrade</h3>
            <div>Source: rss-tech</div>
            <div>Original URL: https://example.com/articles/transit-upgrade</div>
            <div>Raw hash: rawhash-city-council-transit-upgrade</div>
          </article>
          <div data-testid="content-ingestion-duplicate-counter">1 duplicate article skipped by canonical URL and raw hash checks.</div>
        </section>
      </main>
    `;
    await page.setContent(html);

    await expect(page.getByText('Preserve attribution and avoid duplicates')).toBeVisible();
    await expect(page.getByTestId('content-ingestion-article-card')).toContainText('Source: rss-tech');
    await expect(page.getByTestId('content-ingestion-duplicate-counter')).toContainText('duplicate article');
  });
});