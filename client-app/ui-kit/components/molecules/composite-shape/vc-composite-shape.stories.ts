import { VcCompositeShape } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcCompositeShape> = {
  title: "Components/Molecules/VcCompositeShape",
  component: VcCompositeShape,
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcCompositeShape v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {};

export const IconImage: StoryType = {
  args: {
    icon: "academic-cap",
    img: "basket.jpg",
  },
};

export const Mask: StoryType = {
  args: {
    img: "basket.jpg",
    mask: "emoji-happy",
    iconMask: "ai",
  },
};
