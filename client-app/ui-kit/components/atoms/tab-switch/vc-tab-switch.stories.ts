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
  value: "grid",
};

export const Checked = Template.bind({});
Checked.args = {
  icon: "grid",
  label: "Grid",
  value: "value",
  modelValue: "value",
};

export const Disabled = Template.bind({});
Disabled.args = {
  icon: "grid",
  label: "Grid",
  value: "value",
  disabled: true,
};
