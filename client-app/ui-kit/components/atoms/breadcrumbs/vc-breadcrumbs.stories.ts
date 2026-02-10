import { VcBreadcrumbs } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcBreadcrumbs> = {
  title: "Components/Atoms/VcBreadcrumbs",
  component: VcBreadcrumbs,
  argTypes: {
    items: {
      control: "object",
      description: "Array of breadcrumb items",
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcBreadcrumbs v-bind="args" />`,
  }),
  parameters: {
    docs: {
      source: {
        code: `<VcBreadcrumbs :items="items" />`,
      },
    },
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    items: [{ title: "Home" }, { title: "Category" }, { title: "Current Page" }],
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcBreadcrumbs :items="[
            { title: 'Home' },
            { title: 'Category' },
            { title: 'Current Page' }
          ]" />
        `,
      },
    },
  },
};

export const SingleItem: StoryType = {
  args: {
    items: [{ title: "Home" }],
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcBreadcrumbs :items="[
            { title: 'Home' }
          ]" />
        `,
      },
    },
  },
};

export const LongPath: StoryType = {
  args: {
    items: [
      { title: "Home" },
      { title: "Category" },
      { title: "Subcategory" },
      { title: "Products" },
      { title: "Product Details" },
    ],
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcBreadcrumbs :items="[
            { title: 'Home' },
            { title: 'Category' },
            { title: 'Subcategory' },
            { title: 'Products' },
            { title: 'Product Details' }
          ]" />
        `,
      },
    },
  },
};

export const WithRoutes: StoryType = {
  args: {
    items: [
      { title: "Catalog", route: { name: "Catalog" } },
      { title: "Product", route: { name: "Product", params: { id: "123" } } },
      { title: "Product Details" },
    ],
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcBreadcrumbs :items="[
            { title: 'Catalog', route: { name: 'Catalog' } },
            { title: 'Product', route: { name: 'Product', params: { id: '123' } } },
            { title: 'Product Details' }
          ]" />
        `,
      },
    },
  },
};
