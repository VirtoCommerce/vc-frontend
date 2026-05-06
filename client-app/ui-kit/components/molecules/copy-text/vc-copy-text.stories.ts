import { VcCopyText } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcCopyText> = {
  title: "Components/Molecules/VcCopyText",
  component: VcCopyText,
  argTypes: {
    text: {
      control: "text",
      description: "Text that will be copied to clipboard on button click",
    },
    notification: {
      control: "text",
      description: "Success notification message shown after copying",
    },
  },
  args: {
    text: "ORD-2024-00123",
    notification: "Copied to clipboard!",
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcCopyText v-bind="args" />',
  }),
  parameters: {
    docs: {
      source: {
        code: `<VcCopyText text="ORD-2024-00123" notification="Copied to clipboard!" />`,
      },
    },
  },
};

export const WithLabel: StoryType = {
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcCopyText v-bind="args">
      <span class="text-sm text-neutral-600">Order ID:</span>
      <span class="font-bold text-sm">{{ args.text }}</span>
    </VcCopyText>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcCopyText text="ORD-2024-00123" notification="Copied!">
            <span class="text-sm text-neutral-600">Order ID:</span>
            <span class="font-bold text-sm">ORD-2024-00123</span>
          </VcCopyText>
        `,
      },
    },
  },
};
