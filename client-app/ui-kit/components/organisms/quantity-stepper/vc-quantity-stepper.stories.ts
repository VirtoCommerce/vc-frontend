import { VcQuantityStepper } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["sm", "md"];

const meta: Meta<typeof VcQuantityStepper> = {
  title: "Components/Organisms/VcQuantityStepper",
  component: VcQuantityStepper,
  render: (args) => ({
    setup: () => ({ args }),
    template: `
    <VcQuantityStepper
      v-bind="args"
      v-model="localValue"
    />
  `,
  }),
  argTypes: {
    /**
     * Docs:
     *  https://storybook.js.org/docs/vue/essentials/controls#annotation
     *  https://storybook.js.org/docs/vue/api/argtypes#manual-specification
     */
    size: {
      control: "radio",
      options: SIZES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: SIZES.join(" | "),
        },
      },
    },
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {},
};

export const MinMax: StoryType = {
  args: {
    min: 3,
    max: 10,
    value: 3,
  },
};

export const Disabled: StoryType = {
  args: {
    disabled: true,
    value: 0,
  },
};

export const Readonly: StoryType = {
  args: {
    readonly: true,
    value: 5,
  },
};

export const Errored: StoryType = {
  args: {
    error: true,
    message: "Error message",
    value: 5,
  },
};

export const SelectOnClick: StoryType = {
  args: {
    selectOnClick: true,
    value: 5,
  },
};
