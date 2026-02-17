import { VcProductActions } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const DIRECTIONS = ["horizontal", "vertical"];

const meta: Meta<typeof VcProductActions> = {
  title: "Components/Atoms/VcProductActions",
  component: VcProductActions,
  argTypes: {
    direction: {
      control: "select",
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
    template: `<VcProductActions v-bind="args">
  <VcProductActionsButton
    color="danger"
    active
    tooltip-text="VcProductActionsButton"
  />
  <VcProductActionsButton
    icon="compare"
    active
    tooltip-text="VcProductActionsButton"
  />
  </VcProductActions>`,
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {};

export const Vertical: StoryType = {
  args: {
    direction: "vertical",
  },
};

export const VerticalWithBg: StoryType = {
  args: {
    direction: "vertical",
    withBackground: true,
  },
};
