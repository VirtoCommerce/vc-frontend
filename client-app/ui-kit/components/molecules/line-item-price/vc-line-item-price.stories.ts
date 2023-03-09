import { Meta, StoryFn } from "@storybook/vue3";
import { VcLineItemPrice } from "..";

export default {
  title: "Components/Molecules/VcLineItemPrice",
  component: VcLineItemPrice,
} as Meta<typeof VcLineItemPrice>;

const Template: StoryFn<typeof VcLineItemPrice> = (args) => ({
  components: { VcLineItemPrice },
  setup: () => ({ args }),
  template: '<VcLineItemPrice v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  listPrice: {
    amount: 2000,
    formattedAmount: "$2000.00",
  },
  actualPrice: {
    amount: 1000,
    formattedAmount: "$1000.00",
  },
};
