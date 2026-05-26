import React from "react";
import { DESIGN_TOKENS } from "./tokens";
import { EstablishSharedVisualRulesService } from "../../../../api/src/features/design-system/establish-shared-visual-rules.service";
import { createDesignSystemAuditEvent } from "../../../../api/src/features/design-system/establish-shared-visual-rules.telemetry";

const service = new EstablishSharedVisualRulesService();

export function EstablishSharedVisualRulesPage(): JSX.Element {
  const validation = service.validateCanonicalColorContract(DESIGN_TOKENS.colors);
  const auditEvent = createDesignSystemAuditEvent("visual-rules-baseline-rendered", validation.valid ? "success" : "warning", {
    tokenSet: "design-system-v1",
    colorContractValid: validation.valid
  });

  return (
    <main
      style={{
        maxWidth: DESIGN_TOKENS.layout.maxContentWidth,
        margin: "0 auto",
        padding: DESIGN_TOKENS.spacing[2],
        background: DESIGN_TOKENS.colors.bgPrimary,
        color: DESIGN_TOKENS.colors.textPrimary,
        font: DESIGN_TOKENS.typography.body
      }}
      data-audit-event={auditEvent.eventName}
      data-audit-status={auditEvent.status}
    >
      <h1 style={{ font: DESIGN_TOKENS.typography.h1, marginBottom: DESIGN_TOKENS.spacing[1] }}>
        Daily Paper Design System Baseline
      </h1>
      <p style={{ marginBottom: DESIGN_TOKENS.spacing[2] }}>
        Shared tokens, spacing, and accessibility-ready rules for all Phase 1 product surfaces.
      </p>
      <section aria-label="design token summary">
        <p>Color contract valid: {String(validation.valid)}</p>
        <p>Spacing scale: {DESIGN_TOKENS.spacing.join(", ")}</p>
        <p>Desktop columns: {DESIGN_TOKENS.layout.desktopColumns}</p>
      </section>
    </main>
  );
}
