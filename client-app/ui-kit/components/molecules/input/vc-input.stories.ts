import { Meta, StoryFn } from "@storybook/vue3";
import VcButton from "../../atoms/button/vc-button.vue";
import VcIcon from "../../atoms/icon/vc-icon.vue";
import VcInput from "./vc-input.vue";

export default {
  title: "Input",
  component: VcInput,
  argTypes: {
    size: { control: "radio", options: ["sm", "md"] },
    type: { control: "radio", options: ["text", "password", "number"] },
    onClick: { action: "inputClick" },
    onKeypress: { action: "inputKeypress" },
  },
} as Meta<typeof VcInput>;

const Template: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput },
  data: () => ({ inputValue: "" }),
  setup() {
    return { args };
  },
  template: '<VcInput v-bind="args" v-model="inputValue" />',
});

export const Input = Template.bind({});
Input.args = {
  id: "input-id",
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
  ...Input.args,
  autocomplete: "password",
  type: "password",
};

export const InputWithIcon: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput, VcIcon },
  data: () => ({ inputValue: "" }),
  setup() {
    return { args };
  },
  template: `<VcInput v-bind="args" v-model="inputValue">
    <template #endDecorator>
      <VcIcon style="margin: 0 8px; color: darkgray;" name="calendar"/>
    </template>
  </VcInput>`,
});
InputWithIcon.args = {
  ...Input.args,
};

export const InputWithButtonAndIcon: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput, VcButton, VcIcon },
  data: () => ({ inputValue: "" }),
  setup() {
    return { args };
  },
  template: `
  <VcInput v-bind="args" v-model="inputValue">
    <template #startDecorator>
      <VcIcon style="margin-left: 12px; color: grey;" size="sm" name="currency-dollar"/>
    </template>

    <template #endDecorator>
      <VcButton style="height: 100%; padding: 0 8px; border-radius: inherit;">
        Button
      </VcButton>
    </template>
  </VcInput>
  `,
});

export const InputWithButton: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput, VcButton, VcIcon },
  data: () => ({ inputValue: "" }),
  setup() {
    return { args };
  },
  template: `
  <VcInput v-bind="args" v-model="inputValue">
    <template #endDecorator>
      <VcButton size="sm" style="margin: 0 6px; padding: 4px;">
        <VcIcon size="sm" name="calendar"/>
      </VcButton>
    </template>
  </VcInput>
  `,
});
