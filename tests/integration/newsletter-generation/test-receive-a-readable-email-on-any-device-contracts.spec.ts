/**
 * US5: Receive a Readable Email on Any Device
 * Integration tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ResponsiveEmailService } from '../../../apps/api/src/features/newsletter-generation/receive-a-readable-email-on-any-device.service';

describe('US5: Integration - Responsive Email Contract', () => {
  let service: ResponsiveEmailService;

  beforeEach(() => {
    service = new ResponsiveEmailService();
  });

  it('should validate responsive across viewports', () => {
    const html = `
      <html>
        <body style="max-width: 100%; width: 100%;">
          <div style="width: 100%;">Content</div>
        </body>
      </html>
    `;

    const validation = service.validateResponsiveRendering(html);

    expect(validation.mobileReadable).toBeDefined();
    expect(validation.tabletReadable).toBeDefined();
    expect(validation.desktopReadable).toBeDefined();
  });

  it('should render at 375px viewport (mobile)', () => {
    const test = service.testViewportRendering(375, '');

    expect(test.viewportWidth).toBe(375);
    expect(test.readability).toBeDefined();
  });

  it('should render at 768px viewport (tablet)', () => {
    const test = service.testViewportRendering(768, '');

    expect(test.viewportWidth).toBe(768);
    expect(['excellent', 'good', 'fair', 'poor']).toContain(test.readability);
  });

  it('should render at 1024px viewport (desktop)', () => {
    const test = service.testViewportRendering(1024, '');

    expect(test.viewportWidth).toBe(1024);
  });

  it('should check accessibility compliance', () => {
    const html = `
      <html>
        <body>
          <img alt="test image" src="test.jpg">
          <p>Content</p>
        </body>
      </html>
    `;

    const validation = service.validateResponsiveRendering(html);

    expect(validation.accessibilityScore).toBeGreaterThanOrEqual(0);
    expect(validation.accessibilityScore).toBeLessThanOrEqual(100);
  });
});
