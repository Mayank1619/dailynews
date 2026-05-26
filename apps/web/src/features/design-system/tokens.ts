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
    bgPrimary: "#F5F7FB",
    bgSecondary: "#FFFFFF",
    textPrimary: "#111827",
    textSecondary: "#4B5563",
    brandPrimary: "#0EA5E9",
    brandSecondary: "#14B8A6",
    accentHighlight: "#F43F5E",
    success: "#15803D",
    warning: "#F59E0B",
    error: "#B91C1C"
  } satisfies ColorTokens,
  spacing: [8, 16, 24, 32, 48] as const,
  typography: {
    headingFamily: "Fraunces, Georgia, serif",
    bodyFamily: "Plus Jakarta Sans, Segoe UI, sans-serif",
    h1: "700 40px/1.12 Fraunces, Georgia, serif",
    h2: "600 28px/1.24 Fraunces, Georgia, serif",
    h3: "500 20px/1.32 Fraunces, Georgia, serif",
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
