import { VcVendor } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["xs", "sm", "md", "lg"];
const COLORS = ["primary", "secondary", "success", "info", "neutral", "warning", "danger"];

export default {
  title: "Components/Molecules/VcVendor",
  component: VcVendor,
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
} as Meta<typeof VcVendor>;

const Template: StoryFn<typeof VcVendor> = (args) => ({
  components: { VcVendor },
  setup: () => ({ args }),
  template: '<VcVendor v-bind="args" />',
});

export const Basic = Template.bind({});

export const Name = Template.bind({});
Name.args = {
  name: "VirtoCommerce",
};
