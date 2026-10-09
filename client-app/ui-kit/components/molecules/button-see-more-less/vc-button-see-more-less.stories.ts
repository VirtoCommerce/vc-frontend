import { VcButtonSeeMoreLess } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcButtonSeeMoreLess> = {
  title: "Components/Molecules/VcButtonSeeMoreLess",
  component: VcButtonSeeMoreLess,
  argTypes: {
    modelValue: { control: "boolean" },
  },
  args: {
    modelValue: false,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcButtonSeeMoreLess v-bind="args" />',
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcButtonSeeMoreLess />
        `,
      },
    },
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {};

export const Toggled: StoryType = {
  args: {
    modelValue: true,
  },
};
