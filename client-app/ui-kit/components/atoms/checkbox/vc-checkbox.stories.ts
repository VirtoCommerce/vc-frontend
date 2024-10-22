import { VcCheckbox } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["xs", "sm", "md"];
const LABEL = ["left", "right"];

export default {
  title: "Components/Atoms/VcCheckbox",
  component: VcCheckbox,
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
} as Meta<typeof VcCheckbox>;

const Template: StoryFn<typeof VcCheckbox> = (args) => ({
  components: { VcCheckbox },
  setup: () => ({ args }),
  template: '<VcCheckbox v-bind="args" />',
});

const TemplateLabel: StoryFn<typeof VcCheckbox> = (args) => ({
  components: { VcCheckbox },
  setup: () => ({ args }),
  template: '<VcCheckbox v-bind="args">VcCheckbox Label</VcCheckbox>',
});

export const Basic = Template.bind({});

export const Label = TemplateLabel.bind({});

export const BasicDisabled = Template.bind({});
BasicDisabled.args = {
  disabled: true,
};

export const Checked = Template.bind({});
Checked.args = {
  modelValue: true,
};

export const CheckedDisabled = Template.bind({});
CheckedDisabled.args = {
  disabled: true,
  ...Checked.args,
};

export const Indeterminate = Template.bind({});
Indeterminate.args = {
  indeterminate: true,
};

export const IndeterminateDisabled = Template.bind({});
IndeterminateDisabled.args = {
  disabled: true,
  ...Indeterminate.args,
};

export const Message = TemplateLabel.bind({});
Message.args = {
  message: "Some smart message",
};

const TemplateCustomColor: StoryFn<typeof VcCheckbox> = (args) => ({
  components: { VcCheckbox },
  setup: () => ({ args }),
  template: '<VcCheckbox v-bind="args" class="[--vc-checkbox-base-color:red]">VcCheckbox Label</VcCheckbox>',
});

export const CustomColor = TemplateCustomColor.bind({});
CustomColor.args = {
  modelValue: true,
};
