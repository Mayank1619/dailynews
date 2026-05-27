/**
 * US5: Receive a Readable Email on Any Device (Priority: P2)
 * Types and interfaces
 */

export interface ResponsiveEmailTemplate {
  baseWidth: number;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  styles: {
    fontFamily: string;
    bodyFontSize: number;
    headingFontSize: number;
    lineHeight: number;
    containerMaxWidth: number;
  };
}

export interface ResponsiveEmailValidation {
  emailId: string;
  mobileReadable: boolean;
  tabletReadable: boolean;
  desktopReadable: boolean;
  accessibilityScore: number;
  contrastRatios: {
    body: number;
    headings: number;
    links: number;
  };
}

export interface ViewportRenderTest {
  viewportWidth: number;
  viewportHeight: number;
  scrollRequired: boolean;
  readability: 'excellent' | 'good' | 'fair' | 'poor';
}
