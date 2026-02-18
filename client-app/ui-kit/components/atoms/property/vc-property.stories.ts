import { VcProperty } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcProperty> = {
  title: "Components/Atoms/VcProperty",
  component: VcProperty,
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcProperty v-bind="args">Value</VcProperty>',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    label: "Label",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcProperty label="Label">Value</VcProperty>`,
      },
    },
  },
};
