import { describe, expect, it } from "vitest";
import { DESIGN_TOKENS } from "../../src/features/design-system/tokens";

function relativeLuminance(hex: string): number {
  const rgb = hex.replace("#", "").match(/.{1,2}/g);
  if (!rgb || rgb.length !== 3) {
    return 0;
  }
  const transformed = rgb.map((value) => {
    const channel = parseInt(value, 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * transformed[0] + 0.7152 * transformed[1] + 0.0722 * transformed[2];
}

function contrastRatio(foreground: string, background: string): number {
  const fg = relativeLuminance(foreground);
  const bg = relativeLuminance(background);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("design-system accessibility baseline", () => {
  it("maintains WCAG AA ratio between primary text and primary background", () => {
    const ratio = contrastRatio(DESIGN_TOKENS.colors.textPrimary, DESIGN_TOKENS.colors.bgPrimary);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps transition durations subtle and within constitution rule", () => {
    expect(DESIGN_TOKENS.interaction.transitionMs).toBeGreaterThanOrEqual(150);
    expect(DESIGN_TOKENS.interaction.transitionMs).toBeLessThanOrEqual(200);
  });
});
