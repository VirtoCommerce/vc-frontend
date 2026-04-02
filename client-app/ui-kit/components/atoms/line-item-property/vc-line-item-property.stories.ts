import { VcLineItemProperty } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcLineItemProperty> = {
  title: "Components/Atoms/VcLineItemProperty",
  component: VcLineItemProperty,
  argTypes: {
    label: {
      control: "text",
      description: "Property label displayed on the left side",
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcLineItemProperty v-bind="args">Value</VcLineItemProperty>',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    label: "SKU",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcLineItemProperty label="SKU">Value</VcLineItemProperty>`,
      },
    },
  },
};

export const WithLongValue: StoryType = {
  decorators: [
    () => ({
      template: '<div class="w-64"><story /></div>',
    }),
  ],
  args: {
    label: "Description",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template:
      '<VcLineItemProperty v-bind="args">A very long value that might be truncated in narrow containers</VcLineItemProperty>',
  }),
  parameters: {
    docs: {
      source: {
        code: `<VcLineItemProperty label="Description">A very long value that might be truncated in narrow containers</VcLineItemProperty>`,
      },
    },
  },
};

export const WithoutLabel: StoryType = {
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcLineItemProperty v-bind="args">Value only</VcLineItemProperty>',
  }),
  parameters: {
    docs: {
      source: {
        code: `<VcLineItemProperty>Value only</VcLineItemProperty>`,
      },
    },
  },
};
