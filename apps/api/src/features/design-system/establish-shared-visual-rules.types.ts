export type CanonicalColorTokenKey =
  | "bgPrimary"
  | "bgSecondary"
  | "textPrimary"
  | "textSecondary"
  | "brandPrimary"
  | "brandSecondary"
  | "accentHighlight"
  | "success"
  | "warning"
  | "error";

export type CanonicalColorContract = Record<CanonicalColorTokenKey, string>;

export type DesignSystemLayoutRule = {
  maxContentWidth: number;
  desktopColumns: number;
  mobileStack: true;
};

export type BaselineRulesResult = {
  tokenCount: number;
  spacingScale: number[];
  layout: DesignSystemLayoutRule;
};

export type CanonicalColorValidation = {
  valid: boolean;
  missing: CanonicalColorTokenKey[];
  mismatchedHex: Array<{
    key: CanonicalColorTokenKey;
    expected: string;
    actual: string;
  }>;
};
