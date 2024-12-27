import { VcShape } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcShape",
  component: VcShape,
} as Meta<typeof VcShape>;

const Template: StoryFn<typeof VcShape> = (args) => ({
  components: { VcShape },
  setup: () => ({ args }),
  template: '<VcShape v-bind="args" />',
});

export const Basic = Template.bind({});

export const Icon = Template.bind({});
Icon.args = {
  icon: "adjustments",
};

export const Large = Template.bind({});
Large.args = {
  icon: "adjustments",
  size: "100px",
};

export const Image = Template.bind({});
Image.args = {
  img: "/static/images/home/main-banner.webp",
  size: "300px",
};

export const ImageIcon = Template.bind({});
ImageIcon.args = {
  img: "/static/images/home/main-banner.webp",
  size: "300px",
  icon: "adjustments",
};

export const Mask = Template.bind({});
Mask.args = {
  img: "/static/images/home/main-banner.webp",
  size: "300px",
  mask: "academic-cap",
};
