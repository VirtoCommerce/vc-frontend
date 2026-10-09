import { getMoney } from "@/ui-kit/mocks";
import { VcPriceDisplay } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcPriceDisplay> = {
  title: "Components/Atoms/VcPriceDisplay",
  component: VcPriceDisplay,
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcPriceDisplay v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    value: getMoney(1000.99),
  },
  parameters: {
    docs: {
      source: {
        code: `<VcPriceDisplay :value="money" />`,
      },
    },
  },
};
