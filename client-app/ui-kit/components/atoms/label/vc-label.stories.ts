import { VcLabel } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcLabel> = {
  title: "Components/Atoms/VcLabel",
  component: VcLabel,
  argTypes: {
    required: {
      control: "boolean",
      description: "Show required asterisk",
    },
    error: {
      control: "boolean",
      description: "Error state styling",
    },
    forId: {
      control: "text",
      description: "ID of the input element to associate with",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
      description: "Label size",
    },
  },
  args: {
    error: false,
    required: false,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcLabel v-bind="args">Label</VcLabel>',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {},
  parameters: {
    docs: {
      source: {
        code: `
          <VcLabel>Label</VcLabel>
        `,
      },
    },
  },
};

export const Required: StoryType = {
  args: {
    required: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcLabel required>Label</VcLabel>
        `,
      },
    },
  },
};

export const ErrorState: StoryType = {
  args: {
    required: true,
    error: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcLabel required error>Label</VcLabel>
        `,
      },
    },
  },
};
