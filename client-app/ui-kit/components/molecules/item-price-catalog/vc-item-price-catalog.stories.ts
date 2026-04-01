import { getMoney } from "@/ui-kit/mocks";
import { VcItemPriceCatalog } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcItemPriceCatalog> = {
  title: "Components/Molecules/VcItemPriceCatalog",
  component: VcItemPriceCatalog,
  argTypes: {
    withFromLabel: {
      control: "boolean",
      description: 'Prepends a "from" label and always shows the actual price',
    },
    priceColorClass: {
      control: "text",
      description: "Tailwind class applied to the main price",
    },
  },
  args: {
    withFromLabel: false,
    priceColorClass: "text-neutral-900",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcItemPriceCatalog v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const RegularPrice: StoryType = {
  args: {
    value: {
      list: getMoney(99.99),
      actual: getMoney(67.67),
    },
  },
  parameters: {
    docs: {
      source: {
        code: `<VcItemPriceCatalog :value="{ list: price, actual: price }" />`,
      },
    },
  },
};

export const WithDiscount: StoryType = {
  args: {
    value: {
      list: getMoney(149.99),
      actual: getMoney(99.99),
    },
  },
  parameters: {
    docs: {
      source: {
        code: `<VcItemPriceCatalog :value="{ list: listPrice, actual: actualPrice }" />`,
      },
    },
  },
};

export const WithFromLabel: StoryType = {
  args: {
    withFromLabel: true,
    value: {
      list: getMoney(49.99),
      actual: getMoney(49.99),
    },
  },
  parameters: {
    docs: {
      source: {
        code: `<VcItemPriceCatalog with-from-label :value="{ list: price, actual: price }" />`,
      },
    },
  },
};

export const CustomPriceColor: StoryType = {
  args: {
    priceColorClass: "text-success",
    value: {
      list: getMoney(149.99),
      actual: getMoney(89.99),
    },
  },
  parameters: {
    docs: {
      source: {
        code: `<VcItemPriceCatalog price-color-class="text-success" :value="{ list: listPrice, actual: actualPrice }" />`,
      },
    },
  },
};
