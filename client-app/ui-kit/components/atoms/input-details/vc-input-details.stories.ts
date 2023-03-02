import { Meta, StoryFn } from "@storybook/vue3";
import { VcInputDetails } from "..";

export default {
  title: "Components/Atoms/VcInputDetails",
  component: VcInputDetails,
  args: {
    error: false,
    counter: false,
    showEmpty: false,
  },
} as Meta<typeof VcInputDetails>;

const Template: StoryFn<typeof VcInputDetails> = (args) => ({
  components: { VcInputDetails },
  setup: () => ({ args }),
  template: '<VcInputDetails v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  message: "Hint message",
  textLength: 15,
  maxLength: 400,
};

export const Counter = Template.bind({});
Counter.args = {
  ...Basic.args,
  counter: true,
};

export const Error = Template.bind({});
Error.args = {
  ...Counter.args,
  message: "Error message",
  error: true,
};
