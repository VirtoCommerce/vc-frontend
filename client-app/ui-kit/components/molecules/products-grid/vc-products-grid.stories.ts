import { VcProductsGrid } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcProductsGrid> = {
  title: "Components/Molecules/VcProductsGrid",
  component: VcProductsGrid,
  argTypes: {
    short: {
      control: "boolean",
      description: "Limits visible items to match the current column count",
    },
  },
  args: {
    short: false,
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const placeholderItems = Array.from({ length: 8 }, (_, i) => i + 1);

export const Basic: StoryType = {
  render: (args) => ({
    setup: () => ({ args, items: placeholderItems }),
    template: `<VcProductsGrid v-bind="args">
      <div
        v-for="item in items"
        :key="item"
        class="flex h-40 items-center justify-center rounded border bg-neutral-100 text-sm text-neutral-500"
      >
        Product {{ item }}
      </div>
    </VcProductsGrid>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcProductsGrid>
            <VcProductCard v-for="product in products" :key="product.id" :product="product" />
          </VcProductsGrid>
        `,
      },
    },
  },
};

export const Short: StoryType = {
  args: {
    short: true,
  },
  render: (args) => ({
    setup: () => ({ args, items: placeholderItems }),
    template: `<VcProductsGrid v-bind="args">
      <div
        v-for="item in items"
        :key="item"
        class="flex h-40 items-center justify-center rounded border bg-neutral-100 text-sm text-neutral-500"
      >
        Product {{ item }}
      </div>
    </VcProductsGrid>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcProductsGrid short>
            <VcProductCard v-for="product in products" :key="product.id" :product="product" />
          </VcProductsGrid>
        `,
      },
    },
  },
};
