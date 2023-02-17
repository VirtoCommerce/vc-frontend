import VcInputDetails from "./vc-input-details.vue";

import { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Input Details",
  component: VcInputDetails,
} as Meta<typeof VcInputDetails>;

const Template: StoryFn<typeof VcInputDetails> = (args) => ({
  components: { VcInputDetails },
  setup() {
    return { args };
  },
  template: '<VcInputDetails v-bind="args" />',
});

export const InputDetails = Template.bind({});
InputDetails.args = {
  message: "Textarea message",
  counter: true,
  textLength: 15,
  maxLength: 400,
};

export const InputDetailsError = Template.bind({});
InputDetailsError.args = {
  message: "Textarea message",
  error: true,
};
