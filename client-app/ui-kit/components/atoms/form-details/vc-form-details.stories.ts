import VcFormDetails from "./vc-form-details.vue";

import { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Form Details",
  component: VcFormDetails,
} as Meta<typeof VcFormDetails>;

const Template: StoryFn<typeof VcFormDetails> = (args) => ({
  components: { VcFormDetails },
  setup() {
    return { args };
  },
  template: '<VcFormDetails v-bind="args" />',
});

export const FormDetails = Template.bind({});
FormDetails.args = {
  message: "Textarea message",
  counter: true,
  textLength: 15,
  maxLength: 400,
};

export const FormDetailsError = Template.bind({});
FormDetailsError.args = {
  message: "Textarea message",
  error: true,
};
