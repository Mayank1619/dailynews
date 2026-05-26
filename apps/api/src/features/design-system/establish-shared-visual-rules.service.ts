import type {
  BaselineRulesResult,
  CanonicalColorContract,
  CanonicalColorTokenKey,
  CanonicalColorValidation
} from "./establish-shared-visual-rules.types";

const EXPECTED_COLORS: CanonicalColorContract = {
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
};

const SPACING_SCALE = [8, 16, 24, 32, 48];

const LAYOUT_RULE = {
  maxContentWidth: 1200,
  desktopColumns: 12,
  mobileStack: true as const
};

export class EstablishSharedVisualRulesService {
  buildBaselineRules(): BaselineRulesResult {
    return {
      tokenCount: Object.keys(EXPECTED_COLORS).length + SPACING_SCALE.length,
      spacingScale: [...SPACING_SCALE],
      layout: { ...LAYOUT_RULE }
    };
  }

  validateCanonicalColorContract(providedColors: Partial<CanonicalColorContract> = EXPECTED_COLORS): CanonicalColorValidation {
    const missing: CanonicalColorTokenKey[] = [];
    const mismatchedHex: CanonicalColorValidation["mismatchedHex"] = [];

    for (const [key, expected] of Object.entries(EXPECTED_COLORS) as Array<[CanonicalColorTokenKey, string]>) {
      const actual = providedColors[key];
      if (!actual) {
        missing.push(key);
        continue;
      }
      if (actual.toUpperCase() !== expected.toUpperCase()) {
        mismatchedHex.push({ key, expected, actual });
      }
    }

    return {
      valid: missing.length === 0 && mismatchedHex.length === 0,
      missing,
      mismatchedHex
    };
  }
}
