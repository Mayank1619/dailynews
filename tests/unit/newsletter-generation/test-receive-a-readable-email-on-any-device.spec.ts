/**
 * US5: Receive a Readable Email on Any Device
 * Unit tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ResponsiveEmailService } from '../../../apps/api/src/features/newsletter-generation/receive-a-readable-email-on-any-device.service';

describe('US5: Receive a Readable Email on Any Device - Unit Tests', () => {
  let service: ResponsiveEmailService;

  beforeEach(() => {
    service = new ResponsiveEmailService();
  });

  it('should generate responsive CSS', () => {
    const css = service.generateResponsiveCss();

    expect(css).toContain('@media');
    expect(css).toContain('375px');
    expect(css).toContain('768px');
    expect(css).toContain('width: 100%');
  });

  it('should validate responsive rendering', () => {
    const html = `
      <html>
        <body style="max-width: 100%;">
          <div style="width: 100%;">
            <p>Test content</p>
          </div>
        </body>
      </html>
    `;

    const validation = service.validateResponsiveRendering(html);

    expect(validation).toHaveProperty('mobileReadable');
    expect(validation).toHaveProperty('tabletReadable');
    expect(validation).toHaveProperty('desktopReadable');
    expect(validation).toHaveProperty('accessibilityScore');
  });

  it('should test viewport rendering', () => {
    const test = service.testViewportRendering(375, '');

    expect(test.viewportWidth).toBe(375);
    expect(test).toHaveProperty('readability');
  });

  it('should generate viewport test matrix', () => {
    const matrix = service.generateViewportTestMatrix();

    expect(matrix.length).toBeGreaterThan(0);
    expect(matrix[0]).toHaveProperty('viewportWidth');
  });

  it('should validate mobile readability', () => {
    const html = `
      <html>
        <style>
          @media (max-width: 375px) {
            body { font-size: 14px; }
          }
        </style>
        <body style="width: 100%; max-width: 100%;">
          <div>Test</div>
        </body>
      </html>
    `;

    const validation = service.validateResponsiveRendering(html);

    expect(validation.accessibilityScore).toBeGreaterThanOrEqual(0);
    expect(validation.accessibilityScore).toBeLessThanOrEqual(100);
  });
});
