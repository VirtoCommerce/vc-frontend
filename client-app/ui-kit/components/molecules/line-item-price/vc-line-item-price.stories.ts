import { getMoney } from "@/ui-kit/mocks";
import { VcLineItemPrice } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcLineItemPrice> = {
  title: "Components/Molecules/VcLineItemPrice",
  component: VcLineItemPrice,
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcLineItemPrice v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    listPrice: getMoney(2000),
    actualPrice: getMoney(1000),
  },
};
