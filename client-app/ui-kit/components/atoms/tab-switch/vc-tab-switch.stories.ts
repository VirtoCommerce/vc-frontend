import { VcTabSwitch } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["sm", "md"];
const COLORS = ["primary", "secondary", "success", "info", "neutral", "accent", "warning", "danger"];
const LABEL = ["left", "right"];

export default {
  title: "Components/Atoms/VcTabSwitch",
  component: VcTabSwitch,
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
} as Meta<typeof VcTabSwitch>;

const Template: StoryFn<typeof VcTabSwitch> = (args) => ({
  components: { VcTabSwitch },
  setup: () => ({ args }),
  template: '<VcTabSwitch v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  icon: "grid",
  label: "Grid",
  value: "value",
};

export const Checked = Template.bind({});
Checked.args = {
  ...Basic.args,
  modelValue: "value",
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Basic.args,
  disabled: true,
};

export const ColorProps = Template.bind({});
ColorProps.args = {
  ...Basic.args,
  color: "success",
  hoverColor: "info",
  modelValue: "value",
};

export const RGBA_HEXColorProps = Template.bind({});
RGBA_HEXColorProps.args = {
  ...Basic.args,
  color: "rgba(255, 99, 71, 0.8)",
  hoverColor: "#0055CC",
  modelValue: "value",
};

export const ColorCSSVariables = Template.bind({});
ColorCSSVariables.args = {
  ...Basic.args,
  modelValue: "value",
  class: "[--vc-tab-switch-color:#0055CC] [--vc-tab-switch-hover-color:rgba(255,99,71,0.8)]",
};
