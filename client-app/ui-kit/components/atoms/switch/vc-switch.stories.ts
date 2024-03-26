import { VcSwitch } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["xs", "sm", "md", "lg"];
const COLORS = ["primary", "secondary", "success", "info", "neutral", "accent", "warning", "danger"];

export default {
  title: "Components/Atoms/VcSwitch",
  component: VcSwitch,
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
    color: {
      control: "select",
      options: COLORS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: COLORS.join(" | "),
        },
      },
    },
  },
} as Meta<typeof VcSwitch>;

const Template: StoryFn<typeof VcSwitch> = (args) => ({
  components: { VcSwitch },
  setup: () => ({ args }),
  template: '<VcSwitch v-bind="args" />',
});

export const Basic = Template.bind({});

export const On = Template.bind({});
On.args = {
  modelValue: true,
};

export const DisabledOff = Template.bind({});
DisabledOff.args = {
  disabled: true,
};

export const DisabledOn = Template.bind({});
DisabledOn.args = {
  disabled: true,
  modelValue: true,
};
