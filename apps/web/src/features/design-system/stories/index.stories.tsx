import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { DESIGN_TOKENS } from "../tokens";

const TokenPreview = () => {
  return (
    <div
      style={{
        background: DESIGN_TOKENS.colors.bgPrimary,
        color: DESIGN_TOKENS.colors.textPrimary,
        padding: DESIGN_TOKENS.spacing[2],
        font: DESIGN_TOKENS.typography.body,
        borderRadius: DESIGN_TOKENS.spacing[0]
      }}
    >
      Design system token baseline preview
    </div>
  );
};

const meta: Meta<typeof TokenPreview> = {
  title: "Design System/Token Preview",
  component: TokenPreview
};

export default meta;

type Story = StoryObj<typeof TokenPreview>;

export const Default: Story = {};
