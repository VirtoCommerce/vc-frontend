import { VcRating } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const MODES = ["mini", "full"];
const SIZES = ["xs", "sm", "md"];

const meta: Meta<typeof VcRating> = {
  title: "Components/Molecules/VcRating",
  component: VcRating,
  argTypes: {
    mode: {
      control: "inline-radio",
      options: MODES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: MODES.join(" | "),
        },
      },
    },
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
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcRating v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    value: 4.5,
  },
};

export const Label: StoryType = {
  args: {
    value: 4.5,
    label: "Rating",
  },
};

export const Full: StoryType = {
  args: {
    mode: "full",
  },
};

export const FullReadOnly: StoryType = {
  args: {
    value: 4.5,
    mode: "full",
    readOnly: true,
  },
};
