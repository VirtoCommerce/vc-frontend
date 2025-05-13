import { getMoney } from "@/ui-kit/mocks";
import { VcLineItemPrice } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcLineItemPrice",
  component: VcLineItemPrice,
} as Meta<typeof VcLineItemPrice>;

const Template: StoryFn = (args) => ({
  components: { VcLineItemPrice },
  setup: () => ({ args }),
  template: '<VcLineItemPrice v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  listPrice: getMoney(2000),
  actualPrice: getMoney(1000),
};
