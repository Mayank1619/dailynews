import React from "react";
import { DESIGN_TOKENS } from "../design-system/tokens";

export const EDIT_PREFERENCES_COPY = {
  ctaLabel: "Edit Preferences",
  helperText: "Update topics, region, or delivery time in your preferences editor."
} as const;

export function getEditPreferencesHref(): string {
  return "/preferences/edit?source=dashboard";
}

export function EditPreferencesLink(props: { onClick?: () => void }): React.JSX.Element {
  return (
    <div>
      <p style={{ color: DESIGN_TOKENS.colors.textSecondary }}>{EDIT_PREFERENCES_COPY.helperText}</p>
      <a
        href={getEditPreferencesHref()}
        style={{ color: DESIGN_TOKENS.colors.brandPrimary, font: DESIGN_TOKENS.typography.body }}
        onClick={props.onClick}
      >
        {EDIT_PREFERENCES_COPY.ctaLabel}
      </a>
    </div>
  );
}
