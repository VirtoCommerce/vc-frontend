import { VcRadioButton } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["xs", "sm", "md"];
const LABEL = ["left", "right"];

export default {
  title: "Components/Atoms/VcRadioButton",
  component: VcRadioButton,
  argTypes: {
    size: {
      control: "inline-radio",
      options: SIZES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: SIZES.join(" | "),
        },
      },
    },
    labelPosition: {
      control: "inline-radio",
      options: LABEL,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: LABEL.join(" | "),
        },
      },
    },
  },
} as Meta<typeof VcRadioButton>;

const Template: StoryFn<typeof VcRadioButton> = (args) => ({
  components: { VcRadioButton },
  setup: () => ({ args }),
  template: '<VcRadioButton v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  value: "value",
};

export const Checked = Template.bind({});
Checked.args = {
  value: "value",
  modelValue: "value",
};

export const Label = Template.bind({});
Label.args = {
  value: "value",
  label: "RadioButton Label",
};

export const LabelLeft = Template.bind({});
LabelLeft.args = {
  value: "value",
  label: "RadioButton Label",
  labelPosition: "left",
};

export const BreakWord = Template.bind({});
BreakWord.decorators = [
  () => ({
    template: '<div class="w-40"><story /></div>',
  }),
];
BreakWord.args = {
  value: "value",
  label: "RadioButtonLabelLongValueWithoutSpaces",
  breakWord: true,
};

export const MaxLines = Template.bind({});
MaxLines.decorators = [
  () => ({
    template: '<div class="w-40"><story /></div>',
  }),
];
MaxLines.args = {
  value: "value",
  label: "Radio Button Label With Very Long Value",
  breakWord: true,
  maxLines: 2,
};

export const Disabled = Template.bind({});
Disabled.args = {
  value: "value",
  label: "RadioButton Label",
  disabled: true,
};

export const Message = Template.bind({});
Message.args = {
  value: "value",
  label: "RadioButton Label",
  message: "Information message",
};

export const ErrorMessage = Template.bind({});
ErrorMessage.args = {
  value: "value",
  label: "RadioButton Label",
  message: "Error message",
  error: true,
};
