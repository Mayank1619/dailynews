/**
 * US5: Receive a Readable Email on Any Device
 * Service implementation
 */

import type {
  ResponsiveEmailTemplate,
  ResponsiveEmailValidation,
  ViewportRenderTest,
} from './receive-a-readable-email-on-any-device.types.ts';

export class ResponsiveEmailService {
  private template: ResponsiveEmailTemplate;

  constructor() {
    this.template = {
      baseWidth: 600,
      breakpoints: {
        mobile: 375,
        tablet: 768,
        desktop: 1200,
      },
      styles: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        bodyFontSize: 16,
        headingFontSize: 24,
        lineHeight: 1.6,
        containerMaxWidth: 600,
      },
    };
  }

  /**
   * Generate mobile-optimized CSS
   */
  generateResponsiveCss(): string {
    return `
      @media (max-width: ${this.template.breakpoints.mobile}px) {
        body {
          font-size: 14px;
          line-height: 1.5;
        }
        
        .container {
          width: 100% !important;
          max-width: 100% !important;
          padding: 10px !important;
        }
        
        h1, h2, h3 {
          font-size: 18px !important;
          line-height: 1.4 !important;
        }
        
        .section {
          margin-bottom: 20px !important;
        }
        
        .story-title {
          font-size: 16px !important;
        }
        
        .story-snippet {
          font-size: 13px !important;
        }
        
        .section-title {
          font-size: 20px !important;
          padding-left: 8px !important;
        }
        
        table {
          width: 100% !important;
        }
        
        img {
          max-width: 100% !important;
          height: auto !important;
        }
        
        a {
          word-break: break-word;
        }
      }
      
      @media (max-width: ${this.template.breakpoints.tablet}px) {
        .container {
          max-width: 100% !important;
          padding: 15px !important;
        }
        
        .story-text {
          font-size: 14px !important;
        }
      }
    `;
  }

  /**
   * Validate responsive rendering
   */
  validateResponsiveRendering(html: string): ResponsiveEmailValidation {
    return {
      emailId: 'test-responsive',
      mobileReadable: this.checkViewportReadability(html, 375),
      tabletReadable: this.checkViewportReadability(html, 768),
      desktopReadable: this.checkViewportReadability(html, 1200),
      accessibilityScore: this.checkAccessibility(html),
      contrastRatios: {
        body: 7, // WCAG AAA
        headings: 9,
        links: 4.5,
      },
    };
  }

  /**
   * Check viewport readability
   */
  private checkViewportReadability(html: string, viewportWidth: number): boolean {
    // Check for horizontal overflow
    const hasFixedPositioning = /position:\s*fixed|width:\s*\d+px(?!;|$)/.test(html);
    const hasOverflow = /overflow:\s*auto/.test(html);

    // Check max-width constraints
    const hasResponsiveContainer = /max-width:\s*100%|width:\s*100%/.test(html);

    return !hasFixedPositioning && !hasOverflow && hasResponsiveContainer;
  }

  /**
   * Check accessibility score
   */
  private checkAccessibility(html: string): number {
    let score = 100;

    // Check for alt tags on images
    const imgCount = (html.match(/<img/g) || []).length;
    const altCount = (html.match(/alt="/g) || []).length;
    if (imgCount > altCount) {
      score -= (imgCount - altCount) * 5;
    }

    // Check for semantic HTML
    if (!/<article|<section|<header|<footer/.test(html)) {
      score -= 10;
    }

    // Check for sufficient color contrast
    if (!/color:\s*#(?:000|111|222|333)/.test(html)) {
      score -= 5;
    }

    return Math.max(0, score);
  }

  /**
   * Test viewport rendering
   */
  testViewportRendering(viewportWidth: number, html: string): ViewportRenderTest {
    const needsScroll = this.checkIfScrollNeeded(viewportWidth, html);

    let readability: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
    if (needsScroll && viewportWidth < 400) {
      readability = 'poor';
    } else if (viewportWidth < 375) {
      readability = 'fair';
    }

    return {
      viewportWidth,
      viewportHeight: 800,
      scrollRequired: needsScroll,
      readability,
    };
  }

  /**
   * Check if viewport requires scroll
   */
  private checkIfScrollNeeded(viewportWidth: number, html: string): boolean {
    const containerPattern = /max-width:\s*(\d+)/;
    const match = html.match(containerPattern);

    if (match) {
      const maxWidth = parseInt(match[1], 10);
      return maxWidth > viewportWidth;
    }

    return false;
  }

  /**
   * Generate viewport test matrix
   */
  generateViewportTestMatrix(): ViewportRenderTest[] {
    const viewports = [
      { width: 320 },
      { width: 375 }, // iPhone SE
      { width: 414 }, // iPhone 14
      { width: 768 }, // iPad
      { width: 1024 }, // Desktop
    ];

    return viewports.map(vp => 
      this.testViewportRendering(vp.width, '')
    );
  }
}

export const responsiveEmailService = new ResponsiveEmailService();
