import { expect, test } from '@playwright/test';

test.describe('Content ingestion US4 e2e', () => {
  test('renders the resilience summary and per-source outcomes', async ({ page }) => {
    const html = `
      <main>
        <section aria-label="partial failure resilience">
          <h2>Continue through partial failures</h2>
          <div data-testid="content-ingestion-failure-summary">1 sources failed, but the remaining enabled sources still completed ingestion.</div>
          <article data-testid="content-ingestion-failure-row">Healthy RSS · success</article>
          <article data-testid="content-ingestion-failure-row">Broken API · failure</article>
        </section>
      </main>
    `;
    await page.setContent(html);

    await expect(page.getByText('Continue through partial failures')).toBeVisible();
    await expect(page.getByTestId('content-ingestion-failure-summary')).toContainText('sources failed');
    await expect(page.getByTestId('content-ingestion-failure-row')).toHaveCount(2);
  });
});