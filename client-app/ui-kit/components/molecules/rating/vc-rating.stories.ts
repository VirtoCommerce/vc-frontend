import { VcRating } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const MODES = ["mini", "full"];
const SIZES = ["xs", "sm", "md"];

export default {
  title: "Components/Molecules/VcRating",
  component: VcRating,
  argTypes: {
    mode: {
      control: "inline-radio",
      options: MODES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: MODES.join(" | "),
        },
      },
    },
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
  },
} as Meta<typeof VcRating>;

const Template: StoryFn = (args) => ({
  components: { VcRating },
  setup: () => ({ args }),
  template: '<VcRating v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  value: 4.5,
};

export const Label = Template.bind({});
Label.args = {
  value: 4.5,
  label: "Rating",
};

export const Full = Template.bind({});
Full.args = {
  mode: "full",
};

export const FullReadOnly = Template.bind({});
FullReadOnly.args = {
  value: 4.5,
  mode: "full",
  readOnly: true,
};
