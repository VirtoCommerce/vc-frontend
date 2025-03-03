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

const RatingHalfTemplate: StoryFn<typeof VcShape> = (args) => ({
  components: { VcShape },
  setup: () => ({ args }),
  template: `<VcShape v-bind="args">
    <div class="absolute left-0 top-0 bottom-0 w-1/2 bg-primary"></div>
  </VcShape>`,
});

const RatingQuarterTemplate: StoryFn<typeof VcShape> = (args) => ({
  components: { VcShape },
  setup: () => ({ args }),
  template: `<VcShape v-bind="args">
    <div class="absolute left-0 top-0 bottom-0 w-3/12 bg-primary"></div>
  </VcShape>`,
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
  img: "main-banner.webp",
  size: "300px",
};

export const ImageIcon = Template.bind({});
ImageIcon.args = {
  img: "main-banner.webp",
  size: "300px",
  icon: "adjustments",
};

export const Mask = Template.bind({});
Mask.args = {
  img: "/static/images/home/main-banner.webp",
  size: "300px",
  mask: "academic-cap",
};

export const RatingHalf = RatingHalfTemplate.bind({});
RatingHalf.args = {
  mask: "whishlist",
  size: "100px",
};

export const RatingQuarter = RatingQuarterTemplate.bind({});
RatingQuarter.args = {
  mask: "whishlist",
  size: "100px",
};
