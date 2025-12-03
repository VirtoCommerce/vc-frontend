import { VcNavButton } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];
const DIRECTIONS = ["right", "left", "up", "down"];

const meta: Meta<typeof VcNavButton> = {
  title: "Components/Molecules/VcNavButton",
  component: VcNavButton,
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
    direction: {
      control: "inline-radio",
      options: DIRECTIONS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: DIRECTIONS.join(" | "),
        },
      },
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcNavButton v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {};

export const Left: StoryType = {
  args: {
    direction: "left",
  },
};

export const Right: StoryType = {
  args: {
    direction: "right",
  },
};

export const Up: StoryType = {
  args: {
    direction: "up",
  },
};

export const Down: StoryType = {
  args: {
    direction: "down",
  },
};
