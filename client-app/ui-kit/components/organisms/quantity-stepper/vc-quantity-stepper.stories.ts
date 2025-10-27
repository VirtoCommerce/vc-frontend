import { ref } from "vue";
import { VcQuantityStepper } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["sm", "md"];

const meta: Meta<typeof VcQuantityStepper> = {
  title: "Components/Organisms/VcQuantityStepper",
  component: VcQuantityStepper,
  argTypes: {
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
  render: (args) => ({
    setup: () => {
      const localValue = ref(args.value ?? 0);
      return { args, localValue };
    },
    template: `
    <VcQuantityStepper
      v-bind="args"
      v-model="localValue"
    />
  `,
  }),
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
  decorators: [
    () => ({
      template: '<div id="popover-host"></div><story />',
    }),
  ],
};

export const SelectOnClick: StoryType = {
  args: {
    selectOnClick: true,
    value: 5,
  },
};
