import { VcProductTitle } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const TARGETS = ["_blank", "_self"];

const meta: Meta<typeof VcProductTitle> = {
  title: "Components/Molecules/VcProductTitle",
  component: VcProductTitle,
  argTypes: {
    target: {
      control: "inline-radio",
      options: TARGETS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: TARGETS.join(" | "),
        },
      },
    },
  },
  args: {
    title: "Product title",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcProductTitle class="[--vc-product-title-font-size:theme(fontSize.sm)]" v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  parameters: {
    docs: {
      source: {
        code: `<VcProductTitle title="Product title" class="[--vc-product-title-font-size:theme(fontSize.sm)]" />`,
      },
    },
  },
};

export const Link: StoryType = {
  args: {
    to: "/some/link",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcProductTitle title="Product title" to="/some/link" class="[--vc-product-title-font-size:theme(fontSize.sm)]" />`,
      },
    },
  },
};

export const Disabled: StoryType = {
  args: {
    to: "/some/link",
    disabled: true,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcProductTitle title="Product title" to="/some/link" disabled class="[--vc-product-title-font-size:theme(fontSize.sm)]" />`,
      },
    },
  },
};

export const RouterNavigation: StoryType = {
  render: () => ({
    template: `
    <div class="space-y-4 p-6">
      <h2 class="text-xl font-bold">Router Navigation Test</h2>
      <p class="text-neutral-600">Click the product titles below to test navigation:</p>

      <div class="space-y-3">
        <VcProductTitle to="/some/link" class="[--vc-product-title-font-size:theme(fontSize.lg)]">
          Product Title with Link
        </VcProductTitle>
        <VcProductTitle to="/catalog" class="[--vc-product-title-font-size:theme(fontSize.lg)]">
          Catalog Product
        </VcProductTitle>
        <VcProductTitle to="/product/123" class="[--vc-product-title-font-size:theme(fontSize.lg)]">
          Product #123
        </VcProductTitle>
        <VcProductTitle to="/nonexistent" class="[--vc-product-title-font-size:theme(fontSize.lg)]">
          Non-existent Product
        </VcProductTitle>
        <VcProductTitle disabled class="[--vc-product-title-font-size:theme(fontSize.lg)]">
          Disabled Product Title
        </VcProductTitle>
      </div>

      <div class="mt-6 p-4 bg-neutral-100 rounded">
        <h3 class="font-semibold mb-2">Current URL:</h3>
        <code class="text-sm">{{ $route.path }}</code>
      </div>
    </div>
  `,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcProductTitle to="/some/link" class="[--vc-product-title-font-size:theme(fontSize.lg)]">Product Title with Link</VcProductTitle>
          <VcProductTitle to="/catalog" class="[--vc-product-title-font-size:theme(fontSize.lg)]">Catalog Product</VcProductTitle>
          <VcProductTitle to="/product/123" class="[--vc-product-title-font-size:theme(fontSize.lg)]">Product #123</VcProductTitle>
          <VcProductTitle disabled class="[--vc-product-title-font-size:theme(fontSize.lg)]">Disabled Product Title</VcProductTitle>
        `,
      },
    },
  },
};

export const Responsive: StoryType = {
  render: (args) => ({
    setup: () => ({ args }),
    template:
      '<VcProductTitle class="[--vc-product-title-font-size:theme(fontSize.lg)] md:[--vc-product-title-font-size:theme(fontSize.sm)]" v-bind="args">Product title</VcProductTitle>',
  }),
  parameters: {
    docs: {
      source: {
        code: `<VcProductTitle title="Product title" class="[--vc-product-title-font-size:theme(fontSize.lg)] md:[--vc-product-title-font-size:theme(fontSize.sm)]" />`,
      },
    },
  },
};
