import VcInput from "./vc-input.vue";
import VcIcon from "../../atoms/icon/vc-icon.vue";
import VcButton from "../../atoms/button/vc-button.vue";

import { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Input",
  component: VcInput,
  argTypes: {
    size: { control: "radio", options: ["sm", "md"] },
    type: { control: "radio", options: ["text", "password", "number"] },
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

export const Input = Template.bind({});
Input.args = {
  label: "Input Label",
  required: true,
  placeholder: "Enter some value",
  message: "Input tooltip message.",
};

export const InputError = Template.bind({});
InputError.args = {
  ...Input.args,
  error: true,
};

export const InputDefault = Template.bind({});

export const Password = Template.bind({});
Password.args = {
  label: "Password Input",
  required: true,
  placeholder: "Enter some value",
  type: "password",
};

export const InputWithIcon: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput, VcIcon },
  data: () => ({ inputValue: "" }),
  setup() {
    return { args };
  },
  template: `<VcInput v-bind="args" @click="onClick" @keypress="onKeypress" v-model="inputValue">
    <template #endDecorator>
      <VcIcon style="margin: 0 8px; color: orange;" name="calendar"/>
    </template>
  </VcInput>`,
});
InputWithIcon.args = {
  label: "Input With Icon",
  message: "Input tooltip: input with icon",
};

export const InputWithButton: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput, VcButton },
  data: () => ({ inputValue: "" }),
  setup() {
    return { args };
  },
  template: `<VcInput v-bind="args" @click="onClick" @keypress="onKeypress" v-model="inputValue">
    <template #endDecorator>
      <VcButton style="padding: 0 12px;">Button</VcButton>
    </template>
  </VcInput>`,
});
