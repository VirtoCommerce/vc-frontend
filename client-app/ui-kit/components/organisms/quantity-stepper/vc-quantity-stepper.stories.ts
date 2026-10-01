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
    aria: {
      control: false,
      description:
        "Extra ARIA attributes for the input, merged under the spinbutton role and value attributes this stepper owns. Object, not a control.",
      table: { type: { summary: "Record<string, string | number | null>" } },
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

export const AllowZeroBelowMin: StoryType = {
  args: {
    min: 3,
    max: 10,
    value: 0,
    allowZero: true,
  },
};

export const DescribedByExternalMessage: StoryType = {
  args: {
    min: 2,
    max: 5,
    value: 1,
    allowZero: false,
    aria: { "aria-invalid": "true", "aria-describedby": "quantity-stepper-story-message" },
  },
  decorators: [
    () => ({
      template: '<div><story /><p id="quantity-stepper-story-message">You can order from 2 to 5 items</p></div>',
    }),
  ],
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
