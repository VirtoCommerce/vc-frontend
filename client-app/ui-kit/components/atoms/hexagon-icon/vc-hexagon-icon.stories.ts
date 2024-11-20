import { VcHexagonIcon } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Atoms/VcHexagonIcon",
  component: VcHexagonIcon,
} as Meta<typeof VcHexagonIcon>;

const Template: StoryFn<typeof VcHexagonIcon> = (args) => ({
  components: { VcHexagonIcon },
  setup: () => ({ args }),
  template: '<VcHexagonIcon v-bind="args" />',
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
  icon: "adjustments",
};
