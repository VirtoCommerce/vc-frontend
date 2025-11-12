import { VcProductActionsButton } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcProductActionsButton> = {
  title: "Components/Molecules/VcProductActionsButton",
  component: VcProductActionsButton,
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcProductActionsButton v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {};

export const Active: StoryType = {
  args: {
    icon: "compare",
    active: true,
  },
};

export const ActiveColor: StoryType = {
  args: {
    active: true,
    color: "danger",
  },
};

export const IconSize: StoryType = {
  args: {
    active: true,
    color: "danger",
    iconSize: "xs",
  },
};
