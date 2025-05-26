import { VcNavButton } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["xs", "sm", "md"];
const DIRECTIONS = ["right", "left", "up", "down"];

export default {
  title: "Components/Molecules/VcNavButton",
  component: VcNavButton,
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
    direction: {
      control: "inline-radio",
      options: DIRECTIONS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: DIRECTIONS.join(" | "),
        },
      },
    },
  },
} as Meta<typeof VcNavButton>;

const Template: StoryFn = (args) => ({
  components: { VcNavButton },
  setup: () => ({ args }),
  template: '<VcNavButton v-bind="args" />',
});

export const Basic = Template.bind({});

export const Left = Template.bind({});
Left.args = {
  direction: "left",
};

export const Right = Template.bind({});
Right.args = {
  direction: "right",
};

export const Up = Template.bind({});
Up.args = {
  direction: "up",
};

export const Down = Template.bind({});
Down.args = {
  direction: "down",
};
