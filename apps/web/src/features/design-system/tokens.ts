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
    bgPrimary: "#F8FAFC",
    bgSecondary: "#FFFFFF",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    brandPrimary: "#3B82F6",
    brandSecondary: "#22C55E",
    accentHighlight: "#A855F7",
    success: "#16A34A",
    warning: "#F59E0B",
    error: "#DC2626"
  } satisfies ColorTokens,
  spacing: [8, 16, 24, 32, 48] as const,
  typography: {
    headingFamily: "Playfair Display, Georgia, serif",
    bodyFamily: "Inter, Segoe UI, sans-serif",
    h1: "700 32px/1.2 Playfair Display, Georgia, serif",
    h2: "600 24px/1.3 Playfair Display, Georgia, serif",
    h3: "500 18px/1.4 Playfair Display, Georgia, serif",
    body: "400 16px/1.6 Inter, Segoe UI, sans-serif"
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
