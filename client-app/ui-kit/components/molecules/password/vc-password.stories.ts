import VcPassword from "./vc-password.vue";

import { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Password",
  component: VcPassword,
} as Meta<typeof VcPassword>;

const Template: StoryFn<typeof VcPassword> = (args) => ({
  components: { VcPassword },
  data: () => ({ password: "" }),
  setup() {
    return { args };
  },
  template: '<VcPassword v-bind="args" v-model="password" />',
});

export const Password = Template.bind({});
Password.args = {
  label: "Input Label",
  required: true,
  placeholder: "Enter some value",
  message: "",
};
