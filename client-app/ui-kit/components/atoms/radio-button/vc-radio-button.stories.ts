import { VcRadioButton } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];
const LABEL_POSITIONS = ["left", "right"];

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
      options: LABEL_POSITIONS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: LABEL_POSITIONS.join(" | "),
        },
      },
    },
  },
  render: (args) => ({
    components: { VcRadioButton },
    setup: () => ({ args }),
    template: '<VcRadioButton v-bind="args" v-model="args.modelValue" />',
  }),
} as Meta<typeof VcRadioButton>;

type StoryType = StoryObj<typeof VcRadioButton>;

export const Basic: StoryType = {
  args: {
    value: "value",
    ariaLabel: "Basic radio button",
  },
};

export const Checked: StoryType = {
  args: {
    value: "value",
    modelValue: "value",
    ariaLabel: "Checked radio button",
  },
};

export const WithLabel: StoryType = {
  args: {
    value: "value",
    label: "RadioButton Label",
  },
};

export const LabelPositionLeft: StoryType = {
  args: {
    value: "value",
    label: "RadioButton Label",
    labelPosition: "left",
  },
};

export const WithSlot: StoryType = {
  render: (args) => ({
    components: { VcRadioButton },
    setup: () => ({ args }),
    template: '<VcRadioButton v-bind="args" v-model="args.modelValue">Label from slot</VcRadioButton>',
  }),
  args: {
    value: "value",
  },
};

export const BreakWord: StoryType = {
  decorators: [
    () => ({
      template: '<div class="w-40"><story /></div>',
    }),
  ],
  args: {
    value: "value",
    label: "RadioButtonLabelLongValueWithoutSpaces",
    wordBreak: "break-word",
  },
};

export const MaxLines: StoryType = {
  decorators: [
    () => ({
      template: '<div class="w-40"><story /></div>',
    }),
  ],
  args: {
    value: "value",
    label: "Radio Button Label With Very Long Value",
    wordBreak: "break-word",
    maxLines: 2,
  },
};

export const Disabled: StoryType = {
  args: {
    value: "value",
    label: "RadioButton Label",
    disabled: true,
  },
};

export const DisabledChecked: StoryType = {
  args: {
    value: "value",
    modelValue: "value",
    label: "RadioButton Label",
    disabled: true,
  },
};

export const Message: StoryType = {
  args: {
    value: "value",
    label: "RadioButton Label",
    message: "Information message",
  },
};

export const ErrorMessage: StoryType = {
  args: {
    value: "value",
    label: "RadioButton Label",
    message: "Error message",
    error: true,
  },
};

export const AllSizes: StoryType = {
  render: () => ({
    components: { VcRadioButton },
    setup: () => ({ sizes: SIZES }),
    template: `<div class="space-y-4">
      <div v-for="size in sizes" :key="size" class="flex items-center gap-4">
        <span class="w-8 text-sm font-medium">{{ size }}</span>
        <VcRadioButton :size="size" value="option" label="Radio button label" />
      </div>
    </div>`,
  }),
};

export const RadioGroup: StoryType = {
  render: (args) => ({
    components: { VcRadioButton },
    setup: () => {
      const selected = args.modelValue;
      return { args, selected };
    },
    template: `<div class="space-y-2">
      <VcRadioButton v-model="selected" name="group" value="option1" label="Option 1" />
      <VcRadioButton v-model="selected" name="group" value="option2" label="Option 2" />
      <VcRadioButton v-model="selected" name="group" value="option3" label="Option 3" />
    </div>`,
  }),
  args: {
    modelValue: "option1",
  },
};
