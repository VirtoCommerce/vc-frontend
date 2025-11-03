import { getMoney } from "@/ui-kit/mocks";
import { VcLineItemTotal } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcLineItemTotal> = {
  title: "Components/Molecules/VcLineItemTotal",
  component: VcLineItemTotal,
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcLineItemTotal v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    listTotal: getMoney(2000),
    actualTotal: getMoney(1000),
  },
};
