import { VcInputDetails } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Atoms/VcInputDetails",
  component: VcInputDetails,
  args: {
    error: false,
    counter: false,
    showEmpty: false,
    singleLine: false,
  },
} as Meta<typeof VcInputDetails>;

const Template: StoryFn = (args) => ({
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

export const ErrorState = Template.bind({});
ErrorState.args = {
  ...Counter.args,
  message: "Error message",
  error: true,
};

export const SingleLine = Template.bind({});
SingleLine.args = {
  ...Counter.args,
  message:
    "Long long long hint message. Very long hint message. Amet doloremque rerum debitis debitis officia Blanditiis impedit id distinctio voluptatibus enim. Ab magni explicabo consectetur explicabo omnis ex Qui dolorem numquam rerum temporibus sit Hic debitis error sapiente aperiam",
  singleLine: true,
};
