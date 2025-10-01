import { VcProductTitle } from "..";
import type { Meta, StoryFn } from "@storybook/vue3-vite";

const TARGETS = ["_blank", "_self"];

export default {
  title: "Components/Atoms/VcProductTitle",
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
} as Meta<typeof VcProductTitle>;

const Template: StoryFn = (args) => ({
  components: { VcProductTitle },
  setup: () => ({ args }),
  template: '<VcProductTitle class="text-sm" v-bind="args">Product title</VcProductTitle>',
});

export const Basic = Template.bind({});

export const Link = Template.bind({});
Link.args = {
  to: "/some/link",
};

export const Disabled = Template.bind({});
Disabled.args = {
  to: "/some/link",
  disabled: true,
};

export const RouterNavigation: StoryFn = () => ({
  components: { VcProductTitle },
  setup: () => ({}),
  template: `
    <div class="space-y-4 p-6">
      <h2 class="text-xl font-bold">Router Navigation Test</h2>
      <p class="text-gray-600">Click the product titles below to test navigation:</p>

      <div class="space-y-3">
        <VcProductTitle to="/some/link" class="text-lg">
          Product Title with Link
        </VcProductTitle>
        <VcProductTitle to="/catalog" class="text-lg">
          Catalog Product
        </VcProductTitle>
        <VcProductTitle to="/product/123" class="text-lg">
          Product #123
        </VcProductTitle>
        <VcProductTitle to="/nonexistent" class="text-lg">
          Non-existent Product
        </VcProductTitle>
        <VcProductTitle disabled class="text-lg text-gray-400">
          Disabled Product Title
        </VcProductTitle>
      </div>

      <div class="mt-6 p-4 bg-gray-100 rounded">
        <h3 class="font-semibold mb-2">Current URL:</h3>
        <code class="text-sm">{{ $route.path }}</code>
      </div>
    </div>
  `,
});

export const Responsive: StoryFn = (args) => ({
  components: { VcProductTitle },
  setup: () => ({ args }),
  template: '<VcProductTitle class="text-lg md:text-sm" v-bind="args">Product title</VcProductTitle>',
});
