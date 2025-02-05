import { VcCompositeShape } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcCompositeShape",
  component: VcCompositeShape,
} as Meta<typeof VcCompositeShape>;

const Template: StoryFn<typeof VcCompositeShape> = (args) => ({
  components: { VcCompositeShape },
  setup: () => ({ args }),
  template: '<VcCompositeShape v-bind="args" />',
});

export const Basic = Template.bind({});

export const IconImage = Template.bind({});
IconImage.args = {
  icon: "academic-cap",
  img: "basket.jpg",
};

export const Mask = Template.bind({});
Mask.args = {
  img: "basket.jpg",
  mask: "emoji-happy",
  iconMask: "ai",
};
