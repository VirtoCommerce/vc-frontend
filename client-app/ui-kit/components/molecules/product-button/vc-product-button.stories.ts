import { VcProductButton } from "..";
import type { Meta, StoryFn } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];

export default {
  title: "Components/Organisms/VcProductButton",
  component: VcProductButton,
  argTypes: {
    /**
     * Docs:
     *  https://storybook.js.org/docs/vue/essentials/controls#annotation
     *  https://storybook.js.org/docs/vue/api/argtypes#manual-specification
     */
    size: {
      control: "radio",
      options: SIZES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: SIZES.join(" | "),
        },
      },
    },
  },
} as Meta<typeof VcProductButton>;

const Template: StoryFn = (args) => ({
  components: { VcProductButton },
  setup: () => ({ args }),
  template: '<VcProductButton v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  buttonText: "Button Text",
  linkText: "Link text",
  linkTo: "/some/link",
};

export const RouterNavigation: StoryFn = () => ({
  components: { VcProductButton },
  setup: () => ({}),
  template: `
    <div class="space-y-4 p-6">
      <h2 class="text-xl font-bold">Router Navigation Test</h2>
      <p class="text-gray-600">Click the buttons and links below to test navigation:</p>

      <div class="space-y-4">
        <VcProductButton
          button-text="Add to Cart"
          link-text="View Details"
          link-to="/some/link"
        />
        <VcProductButton
          button-text="Buy Now"
          link-text="View Product"
          link-to="/product/123"
        />
        <VcProductButton
          button-text="Add to Wishlist"
          link-text="Go to Catalog"
          link-to="/catalog"
        />
        <VcProductButton
          button-text="Quick Add"
          link-text="Non-existent Page"
          link-to="/nonexistent"
        />
      </div>

      <div class="mt-6 p-4 bg-gray-100 rounded">
        <h3 class="font-semibold mb-2">Current URL:</h3>
        <code class="text-sm">{{ $route.path }}</code>
      </div>
    </div>
  `,
});
