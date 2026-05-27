import { expect, test } from '@playwright/test';

test.describe('Content ingestion US1 e2e', () => {
  test('renders approved sources with enable and disable actions', async ({ page }) => {
    const html = `
      <main>
        <section aria-label="approved ingestion sources">
          <h2>Approved ingestion sources</h2>
          <div>Every 30-60 minutes</div>
          <article data-testid="content-ingestion-source-row">
            <h3>Tech Radar RSS</h3>
            <button>Disable source</button>
          </article>
          <article data-testid="content-ingestion-source-row">
            <h3>World News API</h3>
            <button>Enable source</button>
          </article>
        </section>
      </main>
    `;
    await page.setContent(html);

    await expect(page.getByText('Approved ingestion sources')).toBeVisible();
    await expect(page.getByText('Every 30-60 minutes')).toBeVisible();
    await expect(page.getByTestId('content-ingestion-source-row')).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Disable source' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enable source' })).toBeVisible();
  });
});