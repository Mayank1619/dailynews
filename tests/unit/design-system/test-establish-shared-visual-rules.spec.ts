import { describe, expect, it } from "vitest";
import { EstablishSharedVisualRulesService } from "../../../apps/api/src/features/design-system/establish-shared-visual-rules.service";

describe("US1 unit: establish shared visual rules", () => {
  it("builds baseline rule set with required token domains", () => {
    const service = new EstablishSharedVisualRulesService();
    const result = service.buildBaselineRules();

    expect(result.tokenCount).toBeGreaterThan(8);
    expect(result.layout.desktopColumns).toBe(12);
    expect(result.spacingScale).toEqual([8, 16, 24, 32, 48]);
  });
});
