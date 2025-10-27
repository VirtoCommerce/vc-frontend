import { VcAddToCart } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["sm", "md"];

const meta: Meta<typeof VcAddToCart> = {
  title: "Components/Organisms/VcAddToCart",
  component: VcAddToCart,
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
    modelValue: { table: { type: { summary: "number" } } },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
    hideButton: { control: "boolean" },
  },
  args: {
    readonly: false,
    disabled: false,
    loading: false,
    isActive: true,
    hideButton: false,
    size: "md",
    modelValue: 1,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcAddToCart v-bind="args" v-model="args.modelValue" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {};

export const Loading: StoryType = {
  args: {
    loading: true,
  },
};

export const Disabled: StoryType = {
  args: {
    disabled: true,
  },
};

export const OutOfStock: StoryType = {
  args: {
    isInStock: false,
    isAvailable: false,
  },
};

export const WithError: StoryType = {
  args: {
    error: true,
    message: "Error message",
  },
};

export const HideButton: StoryType = {
  args: {
    hideButton: true,
  },
};
