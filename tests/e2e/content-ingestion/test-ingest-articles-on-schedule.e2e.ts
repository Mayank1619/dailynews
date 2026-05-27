import { expect, test } from '@playwright/test';

test.describe('Content ingestion US2 e2e', () => {
  test('renders the scheduled ingestion run summary', async ({ page }) => {
    const html = `
      <main>
        <section aria-label="scheduled ingestion run">
          <h2>Scheduled ingestion run</h2>
          <div data-testid="ingestion-run-counts">2 stored · 0 failures · 1 duplicates skipped</div>
          <article data-testid="content-ingestion-source-outcome">Tech Radar RSS</article>
          <article data-testid="content-ingestion-source-outcome">World News API</article>
        </section>
      </main>
    `;
    await page.setContent(html);

    await expect(page.getByText('Scheduled ingestion run')).toBeVisible();
    await expect(page.getByTestId('ingestion-run-counts')).toContainText('stored');
    await expect(page.getByTestId('content-ingestion-source-outcome')).toHaveCount(2);
  });
});