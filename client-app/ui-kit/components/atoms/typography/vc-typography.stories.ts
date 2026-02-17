import { VcTypography } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const VARIANTS = ["h1", "h2", "h3", "h4", "h5", "h6", "base"];

const meta: Meta<typeof VcTypography> = {
  title: "Components/Atoms/VcTypography",
  component: VcTypography,
  argTypes: {
    variant: {
      control: "select",
      options: VARIANTS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: VARIANTS.join(" | "),
        },
      },
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcTypography v-bind="args">Lorem ipsum DOLOR</VcTypography>',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {};

export const H1: StoryType = {
  args: {
    tag: "h1",
  },
};

export const H2: StoryType = {
  args: {
    tag: "h2",
  },
};

export const H3: StoryType = {
  args: {
    tag: "h3",
  },
};
