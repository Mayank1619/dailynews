export type ColorTokens = {
  bgPrimary: string;
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  brandPrimary: string;
  brandSecondary: string;
  accentHighlight: string;
  success: string;
  warning: string;
  error: string;
};

export type TypographyTokens = {
  headingFamily: string;
  bodyFamily: string;
  h1: string;
  h2: string;
  h3: string;
  body: string;
};

export type LayoutTokens = {
  maxContentWidth: number;
  desktopColumns: number;
  mobileStack: true;
};

export const DESIGN_TOKENS = {
  colors: {
    bgPrimary: "#070912",
    bgSecondary: "#111827",
    textPrimary: "#F8FAFC",
    textSecondary: "#A7B3C8",
    brandPrimary: "#22D3EE",
    brandSecondary: "#A855F7",
    accentHighlight: "#F472B6",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#FB7185"
  } satisfies ColorTokens,
  spacing: [8, 16, 24, 32, 48] as const,
  typography: {
    headingFamily: "Plus Jakarta Sans, Segoe UI, sans-serif",
    bodyFamily: "Plus Jakarta Sans, Segoe UI, sans-serif",
    h1: "800 40px/1.12 Plus Jakarta Sans, Segoe UI, sans-serif",
    h2: "800 28px/1.24 Plus Jakarta Sans, Segoe UI, sans-serif",
    h3: "700 20px/1.32 Plus Jakarta Sans, Segoe UI, sans-serif",
    body: "400 16px/1.65 Plus Jakarta Sans, Segoe UI, sans-serif"
  } satisfies TypographyTokens,
  layout: {
    maxContentWidth: 1200,
    desktopColumns: 12,
    mobileStack: true
  } satisfies LayoutTokens,
  interaction: {
    hoverScale: 1.02,
    transitionMs: 180
  }
} as const;
