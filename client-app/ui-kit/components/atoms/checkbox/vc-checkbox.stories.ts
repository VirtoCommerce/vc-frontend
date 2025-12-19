import { VcCheckbox } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];
const LABEL = ["left", "right"];

export default {
  title: "Components/Atoms/VcCheckbox",
  component: VcCheckbox,
  argTypes: {
    size: {
      control: "inline-radio",
      options: SIZES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: SIZES.join(" | "),
        },
      },
    },
    labelPosition: {
      control: "inline-radio",
      options: LABEL,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: LABEL.join(" | "),
        },
      },
    },
  },
} as Meta<typeof VcCheckbox>;

type StoryType = StoryObj<typeof VcCheckbox>;

export const Basic: StoryType = {
  args: {
    ariaLabel: "Basic checkbox",
  },
};

export const Label: StoryType = {
  render: (args) => ({
    components: { VcCheckbox },
    setup: () => ({ args }),
    template: '<VcCheckbox v-bind="args">VcCheckbox Label</VcCheckbox>',
  }),
};

export const BasicDisabled: StoryType = {
  args: {
    disabled: true,
    ariaLabel: "Disabled checkbox",
  },
};

export const Checked: StoryType = {
  args: {
    modelValue: true,
    ariaLabel: "Checked checkbox",
  },
};

export const CheckedDisabled: StoryType = {
  args: {
    disabled: true,
    modelValue: true,
    ariaLabel: "Checked disabled checkbox",
  },
};

export const Indeterminate: StoryType = {
  args: {
    indeterminate: true,
    ariaLabel: "Indeterminate checkbox",
  },
};

export const IndeterminateDisabled: StoryType = {
  args: {
    disabled: true,
    indeterminate: true,
    ariaLabel: "Indeterminate disabled checkbox",
  },
};

export const Message: StoryType = {
  render: (args) => ({
    components: { VcCheckbox },
    setup: () => ({ args }),
    template: '<VcCheckbox v-bind="args">VcCheckbox Label</VcCheckbox>',
  }),
  args: {
    message: "Some smart message",
  },
};

export const CustomColor: StoryType = {
  render: (args) => ({
    components: { VcCheckbox },
    setup: () => ({ args }),
    template: '<VcCheckbox v-bind="args" class="[--vc-checkbox-base-color:red]">VcCheckbox Label</VcCheckbox>',
  }),
  args: {
    modelValue: true,
  },
};
