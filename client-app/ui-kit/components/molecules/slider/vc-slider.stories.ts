import { VcSlider } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcSlider",
  component: VcSlider,
  argTypes: {},
} as Meta<typeof VcSlider>;

const Template: StoryFn<typeof VcSlider> = (args) => ({
  components: { VcSlider },
  setup: () => ({ args }),
  template: '<VcSlider v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {};
