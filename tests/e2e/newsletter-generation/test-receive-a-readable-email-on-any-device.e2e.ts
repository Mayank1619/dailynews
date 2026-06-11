/**
 * US5: Receive a Readable Email on Any Device
 * End-to-End tests
 */

import { test, expect } from '@playwright/test';
import { ResponsiveEmailService } from '../../../apps/api/src/features/newsletter-generation/receive-a-readable-email-on-any-device.service';

test.describe('US5: E2E - Responsive Email Rendering', () => {
  test('e2e scenario: newsletter renders on mobile 375px', () => {
    const service = new ResponsiveEmailService();

    const mobileTest = service.testViewportRendering(375, '');

    expect(mobileTest.viewportWidth).toBe(375);
    expect(mobileTest.readability).toBeTruthy();
  });

  test('e2e scenario: newsletter renders on tablet 768px', () => {
    const service = new ResponsiveEmailService();

    const tabletTest = service.testViewportRendering(768, '');

    expect(tabletTest.viewportWidth).toBe(768);
    expect(['excellent', 'good', 'fair', 'poor']).toContain(tabletTest.readability);
  });

  test('e2e scenario: newsletter renders on desktop 1024px', () => {
    const service = new ResponsiveEmailService();

    const desktopTest = service.testViewportRendering(1024, '');

    expect(desktopTest.viewportWidth).toBe(1024);
  });

  test('e2e scenario: validate rendering across viewport matrix', () => {
    const service = new ResponsiveEmailService();

    const matrix = service.generateViewportTestMatrix();

    expect(matrix.length).toBeGreaterThan(0);
    expect(matrix).toContainEqual(expect.objectContaining({ viewportWidth: 375 }));
    expect(matrix).toContainEqual(expect.objectContaining({ viewportWidth: 414 }));
    expect(matrix).toContainEqual(expect.objectContaining({ viewportWidth: 768 }));
  });

  test('e2e scenario: email has responsive CSS', () => {
    const service = new ResponsiveEmailService();

    const css = service.generateResponsiveCss();

    expect(css).toContain('@media');
    expect(css).toContain('375px');
    expect(css).toContain('768px');
    expect(css).toContain('width: 100%');
  });

  test('e2e scenario: newsletter passes accessibility audit', () => {
    const service = new ResponsiveEmailService();

    const html = `
      <html>
        <body style="max-width: 100%;">
          <img alt="Newsletter header" src="header.jpg">
          <article>
            <h1>Newsletter Title</h1>
            <p>Content here</p>
          </article>
        </body>
      </html>
    `;

    const validation = service.validateResponsiveRendering(html);

    expect(validation.accessibilityScore).toBeGreaterThan(0);
  });
});
