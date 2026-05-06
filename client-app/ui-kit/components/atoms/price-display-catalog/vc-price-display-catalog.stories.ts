import { getMoney } from "@/ui-kit/mocks";
import { VcPriceDisplayCatalog } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcPriceDisplayCatalog> = {
  title: "Components/Atoms/VcPriceDisplayCatalog",
  component: VcPriceDisplayCatalog,
  tags: ["deprecated"],
  parameters: {
    deprecated:
      "This component is not used in the application (only inside VcItemPriceCatalog which is also deprecated). Use VcPriceDisplay or VcProductPrice instead.",
  },
  argTypes: {
    isOldPrice: {
      control: "boolean",
      description: "Applies strikethrough styling to indicate an old/original price",
    },
  },
  args: {
    isOldPrice: false,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcPriceDisplayCatalog v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    value: getMoney(99.99),
  },
  parameters: {
    docs: {
      source: {
        code: `<VcPriceDisplayCatalog :value="money" />`,
      },
    },
  },
};

export const OldPrice: StoryType = {
  args: {
    value: getMoney(149.99),
    isOldPrice: true,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcPriceDisplayCatalog :value="money" is-old-price />`,
      },
    },
  },
};

export const PriceComparison: StoryType = {
  render: () => ({
    setup: () => ({
      oldPrice: getMoney(149.99),
      currentPrice: getMoney(99.99),
    }),
    template: `<div class="flex items-baseline gap-2">
      <VcPriceDisplayCatalog :value="currentPrice" />
      <VcPriceDisplayCatalog :value="oldPrice" is-old-price class="text-neutral-400" />
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <div class="flex items-baseline gap-2">
            <VcPriceDisplayCatalog :value="currentPrice" />
            <VcPriceDisplayCatalog :value="oldPrice" is-old-price class="text-neutral-400" />
          </div>
        `,
      },
    },
  },
};
