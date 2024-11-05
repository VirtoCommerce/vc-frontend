import { getMoney } from "@/ui-kit/mocks";
import { VcProductTotal } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const ALIGNS = ["start", "end"];

export default {
  title: "Components/Molecules/VcProductTotal",
  component: VcProductTotal,
  argTypes: {
    align: {
      control: "inline-radio",
      options: ALIGNS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: ALIGNS.join(" | "),
        },
      },
    },
  },
} as Meta<typeof VcProductTotal>;

const Template: StoryFn<typeof VcProductTotal> = (args) => ({
  components: { VcProductTotal },
  setup: () => ({ args }),
  template: '<VcProductPrice v-bind="args" />',
});

const sharedArgs = {
  actualPrice: getMoney(1599999999),
  listPrice: getMoney(1799999999),
};

export const Basic = Template.bind({});
Basic.args = {
  ...sharedArgs,
};

export const AlignEnd = Template.bind({});
AlignEnd.args = {
  ...sharedArgs,
  align: "end",
};

export const SingleLine = Template.bind({});
SingleLine.args = {
  ...sharedArgs,
  singleLine: true,
};
