import { VcLineItemTotal } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcLineItemTotal",
  component: VcLineItemTotal,
} as Meta<typeof VcLineItemTotal>;

const Template: StoryFn<typeof VcLineItemTotal> = (args) => ({
  components: { VcLineItemTotal },
  setup: () => ({ args }),
  template: '<VcLineItemTotal v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  listTotal: {
    amount: 2000,
    formattedAmount: "$2000.00",
  },
  actualTotal: {
    amount: 1000,
    formattedAmount: "$1000.00",
  },
};
