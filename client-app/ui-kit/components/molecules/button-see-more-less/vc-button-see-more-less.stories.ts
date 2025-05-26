import { VcButtonSeeMoreLess } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcButtonSeeMoreLess",
  component: VcButtonSeeMoreLess,
  argTypes: {
    modelValue: { control: "boolean" },
  },
  args: {
    modelValue: false,
  },
} as Meta<typeof VcButtonSeeMoreLess>;

const Template: StoryFn = (args) => ({
  components: { VcButtonSeeMoreLess },
  setup: () => ({ args }),
  template: '<VcButtonSeeMoreLess v-bind="args" />',
});

export const Basic = Template.bind({});

export const Toggled = Template.bind({});
Toggled.args = {
  modelValue: true,
};
