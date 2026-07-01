import { VcEmptyPage } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcEmptyPage> = {
  title: "Components/Templates/VcEmptyPage",
  component: VcEmptyPage,
  argTypes: {
    title: {
      control: "text",
      description: "Page heading",
    },
    icon: {
      control: "text",
      description: "Icon name used in the composite shape illustration",
    },
    hasBgImage: {
      control: "boolean",
      description: "Shows decorative background SVG",
    },
    hideMobileSide: {
      control: "boolean",
      description: "Hides the illustration on mobile viewports",
    },
  },
  args: {
    hasBgImage: false,
    hideMobileSide: false,
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    title: "Page not found",
    icon: "outline-emoji-sad",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcEmptyPage v-bind="args">
      <p class="mb-6 text-neutral-600">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <VcButton color="primary">Go to homepage</VcButton>
    </VcEmptyPage>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcEmptyPage title="Page not found" icon="outline-emoji-sad">
            <p>Sorry, we couldn't find the page you're looking for.</p>
            <VcButton color="primary">Go to homepage</VcButton>
          </VcEmptyPage>
        `,
      },
    },
  },
};

export const CartIsEmpty: StoryType = {
  args: {
    title: "Your cart is empty",
    icon: "shopping-cart",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcEmptyPage v-bind="args">
      <p class="mb-6 text-neutral-600">
        Looks like you haven't added anything to your cart yet.
      </p>
      <VcButton color="primary">Continue shopping</VcButton>
    </VcEmptyPage>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcEmptyPage title="Your cart is empty" icon="shopping-cart">
            <p>Looks like you haven't added anything to your cart yet.</p>
            <VcButton color="primary">Continue shopping</VcButton>
          </VcEmptyPage>
        `,
      },
    },
  },
};

export const WithBreadcrumbs: StoryType = {
  args: {
    title: "No results found",
    icon: "search",
    breadcrumbs: [{ title: "Home", route: "/" }, { title: "Catalog", route: "/catalog" }, { title: "Search results" }],
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcEmptyPage v-bind="args">
      <p class="mb-6 text-neutral-600">
        We couldn't find any products matching your search.
        Try different keywords or browse our categories.
      </p>
      <VcButton variant="outline" color="secondary">Clear filters</VcButton>
    </VcEmptyPage>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcEmptyPage title="No results found" icon="search" :breadcrumbs="breadcrumbs">
            <p>We couldn't find any products matching your search.</p>
          </VcEmptyPage>
        `,
      },
    },
  },
};
