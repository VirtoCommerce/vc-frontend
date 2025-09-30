import { VcMenuItem } from "..";
import { VcIcon } from "../../atoms";
import type { Meta, StoryFn } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md", "lg"];
const COLORS = ["primary", "secondary", "success", "info", "neutral", "warning", "danger"];

export default {
  title: "Components/Molecules/VcMenuItem",
  component: VcMenuItem,
  argTypes: {
    size: {
      control: "inline-radio",
      options: SIZES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: SIZES.join(" | "),
        },
      },
    },
    color: {
      control: "select",
      options: COLORS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: COLORS.join(" | "),
        },
      },
    },
  },
} as Meta<typeof VcMenuItem>;

const Template: StoryFn = (args) => ({
  components: { VcMenuItem },
  setup: () => ({ args }),
  template: '<VcMenuItem v-bind="args">Menu Item text</VcMenuItem>',
});

export const Basic = Template.bind({});

export const Active = Template.bind({});
Active.args = {
  active: true,
};

export const Link = Template.bind({});
Link.args = {
  to: "/some/link",
};

export const ExternalLink = Template.bind({});
ExternalLink.args = {
  externalLink: "https://example.com",
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const Icon: StoryFn = (args) => ({
  components: { VcMenuItem, VcIcon },
  setup: () => ({ args }),
  template: `<VcMenuItem v-bind="args">
    <VcIcon name="cog" />
    <span>Menu item text</span>
  </VcMenuItem>`,
});

export const IconDisabled = Icon.bind({});
IconDisabled.args = {
  disabled: true,
};

export const Truncate: StoryFn = (args) => ({
  components: { VcMenuItem },
  setup: () => ({ args }),
  template: `<VcMenuItem v-bind="args" class="w-36">
    <span>Long long long Menu item text</span>
  </VcMenuItem>`,
});
Truncate.args = {
  truncate: true,
};

export const RouterNavigation: StoryFn = () => ({
  components: { VcMenuItem },
  setup: () => ({}),
  template: `
    <div class="space-y-4 p-6">
      <h2 class="text-xl font-bold">Router Navigation Test</h2>
      <p class="text-gray-600">Click the menu items below to test navigation:</p>

      <div class="space-y-2">
        <VcMenuItem to="/some/link" color="primary" size="md">
          Some Link
        </VcMenuItem>
        <VcMenuItem to="/catalog" color="secondary" size="md">
          Catalog
        </VcMenuItem>
        <VcMenuItem to="/product/123" color="info" size="md">
          Product #123
        </VcMenuItem>
        <VcMenuItem to="/nonexistent" color="warning" size="md">
          Non-existent Page
        </VcMenuItem>
        <VcMenuItem external-link="https://example.com" color="neutral" size="md">
          External Link
        </VcMenuItem>
      </div>

      <div class="mt-6 p-4 bg-gray-100 rounded">
        <h3 class="font-semibold mb-2">Current URL:</h3>
        <code class="text-sm">{{ $route.path }}</code>
      </div>
    </div>
  `,
});

export const AllStates: StoryFn = () => ({
  components: { VcMenuItem },
  setup: () => ({ colors: COLORS, sizes: SIZES }),
  template: `<div class="space-y-8">
    <div v-for="size in sizes" class="space-y-3">
      <h2 class="text-lg font-bold">Size: {{ size }}</h2>

      <div class="flex flex-wrap gap-2 items-center">
        <VcMenuItem v-for="color in colors" :size="size" :color="color">
          Color: {{ color }}
        </VcMenuItem>
      </div>
    </div>
  </div>
  `,
});
