import { Meta, StoryFn } from "@storybook/vue3";
import { VcLabel } from "..";

export default {
  title: "Components/Atoms/VcLabel",
  component: VcLabel,
  args: {
    error: false,
    required: false,
  },
} as Meta<typeof VcLabel>;

const Template: StoryFn<typeof VcLabel> = (args) => ({
  components: { VcLabel },
  setup: () => ({ args }),
  template: '<VcLabel v-bind="args">Label</VcLabel>',
});

export const Basic = Template.bind({});

export const Required = Template.bind({});
Required.args = {
  required: true,
};

export const Error = Template.bind({});
Error.args = {
  required: true,
  error: true,
};
