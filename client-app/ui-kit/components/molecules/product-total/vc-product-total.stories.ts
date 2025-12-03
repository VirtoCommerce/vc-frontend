import { getMoney } from "@/ui-kit/mocks";
import { VcProductTotal } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcProductTotal> = {
  title: "Components/Molecules/VcProductTotal",
  component: VcProductTotal,
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcProductTotal v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    actualPrice: getMoney(1599999999),
    listPrice: getMoney(1799999999),
  },
};
