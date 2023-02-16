import VcInput from "./vc-input.vue";

import { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Input",
  component: VcInput,
  argTypes: {
    size: { control: "radio", options: ["sm", "md"] },
    type: { control: "radio", options: ["text", "password", "message"] },
    onClick: { action: "click" },
    onKeypress: { action: "keypress" },
  },
} as Meta<typeof VcInput>;

const Template: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput },
  data: () => ({ inputValue: "" }),
  setup() {
    return { args };
  },
  template: '<VcInput v-bind="args" @click="onClick" @keypress="onKeypress" v-model="inputValue" />',
});

//👇 Each story then reuses that template
export const Input = Template.bind({});
Input.args = {
  label: "Input Label",
  required: true,
  placeholder: "Enter some value",
};
