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

const TemplateCustom: StoryFn<typeof VcShape> = (args) => ({
  components: { VcShape },
  setup: () => ({ args }),
  template: `<VcShape v-bind="args">
    <div class="p-3 text-additional-50 font-bold">16</div>
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
  img: "/static/images/home/main-banner.webp",
  size: "300px",
  mask: "/static/icons/basic/adjustments.svg",
};

export const ImageIcon = Template.bind({});
ImageIcon.args = {
  img: "/static/images/home/main-banner.webp",
  size: "300px",
  icon: "adjustments",
};

export const Custom = TemplateCustom.bind({});
Custom.args = {
  img: "/static/images/home/main-banner.webp",
  size: "3rem",
  mask: "/static/icons/basic/document.svg",
};
