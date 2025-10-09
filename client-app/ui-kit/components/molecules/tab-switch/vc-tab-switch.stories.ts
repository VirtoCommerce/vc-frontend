import { VcTabSwitch } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["sm", "md"];
const COLORS = ["primary", "secondary", "success", "info", "neutral", "accent", "warning", "danger"];
const LABEL = ["left", "right"];

const meta: Meta<typeof VcTabSwitch> = {
  title: "Components/Molecules/VcTabSwitch",
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
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcTabSwitch v-bind="args" />',
  }),
} as Meta<typeof VcTabSwitch>;

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    icon: "grid",
    label: "Grid",
    value: "value",
  },
};

export const Checked: StoryType = {
  args: {
    icon: "grid",
    label: "Grid",
    value: "value",
    modelValue: "value",
  },
};

export const ColorProps: StoryType = {
  args: {
    ...Basic.args,
    color: "success",
    hoverColor: "info",
  },
};

export const RGBA_HEXColorProps: StoryType = {
  args: {
    ...Basic.args,
    color: "rgba(255, 99, 71, 0.8)",
    hoverColor: "#0055CC",
  },
};

export const ColorCSSVariables: StoryType = {
  args: {
    ...Basic.args,
    class: "[--vc-tab-switch-color:#0055CC] [--vc-tab-switch-hover-color:rgba(255,99,71,0.8)]",
  },
};

export const LabelPosition: StoryType = {
  args: {
    ...Basic.args,
    labelPosition: "start",
  },
};

export const Disabled: StoryType = {
  args: {
    ...Basic.args,
    disabled: true,
  },
};
