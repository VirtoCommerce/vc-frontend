import { VcLabel } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Atoms/VcLabel",
  component: VcLabel,
  args: {
    error: false,
    required: false,
  },
} as Meta<typeof VcLabel>;

const Template: StoryFn = (args) => ({
  components: { VcLabel },
  setup: () => ({ args }),
  template: '<VcLabel v-bind="args">Label</VcLabel>',
});

export const Basic = Template.bind({});

export const Required = Template.bind({});
Required.args = {
  required: true,
};

export const ErrorState = Template.bind({});
ErrorState.args = {
  required: true,
  error: true,
};
