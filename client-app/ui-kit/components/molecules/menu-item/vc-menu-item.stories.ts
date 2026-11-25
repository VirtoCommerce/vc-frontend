import { ref } from "vue";
import { VcMenuItem, VcButton, VcDropdownMenu } from "..";
import { VcCheckbox, VcRadioButton } from "../../atoms";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md", "lg"];
const COLORS = ["primary", "secondary", "success", "info", "neutral", "warning", "danger"];

const meta: Meta<typeof VcMenuItem> = {
  title: "Components/Molecules/VcMenuItem",
  component: VcMenuItem,
  parameters: {
    docs: {
      description: {
        component: [
          "A row of a menu or a list. A theme, a design or a list restyles its rows through these CSS variables:",
          "",
          "| Variable | Classic value |",
          "| --- | --- |",
          "| `--vc-menu-item-bg-color` | additional-50; dark: the root's background (none) |",
          "| `--vc-menu-item-hover-bg-color` | the `color` prop's 50 shade; dark: its 100 shade |",
          "| `--vc-menu-item-active-bg-color` | the `color` prop's 100 shade |",
          "| `--vc-menu-item-padding-x` | 0.75rem |",
          "| `--vc-menu-item-radius` | the root's radius (none) |",
        ].join("\n"),
      },
    },
  },
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
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcMenuItem v-bind="args">Menu Item text</VcMenuItem>',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {};

export const Active: StoryType = {
  args: {
    active: true,
  },
};

export const Link: StoryType = {
  args: {
    to: "/some/link",
  },
};

export const ExternalLink: StoryType = {
  args: {
    externalLink: "https://example.com",
  },
};

export const Disabled: StoryType = {
  args: {
    disabled: true,
  },
};

export const Icon: StoryType = {
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcMenuItem v-bind="args">
      <VcIcon name="cog" />
      <span>Menu item text</span>
    </VcMenuItem>`,
  }),
};

export const IconDisabled: StoryType = {
  args: {
    disabled: true,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcMenuItem v-bind="args">
      <VcIcon name="cog" />
      <span>Menu item text</span>
    </VcMenuItem>`,
  }),
};

export const Truncate: StoryType = {
  args: {
    truncate: true,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcMenuItem v-bind="args" class="w-36">
      <span>Long long long Menu item text</span>
    </VcMenuItem>`,
  }),
};

export const RouterNavigation: StoryType = {
  render: () => ({
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
  }),
};

export const WithCheckbox: StoryType = {
  render: (args) => ({
    components: { VcMenuItem, VcCheckbox, VcButton, VcDropdownMenu },
    setup: () => {
      const checked = ref([true, false, true, false]);
      return { args, checked };
    },
    template: `<VcDropdownMenu>
      <template #trigger="{ triggerProps }">
        <VcButton v-bind="triggerProps">Open menu</VcButton>
      </template>

      <template #content>
        <VcMenuItem v-for="(_, i) in checked" :key="i" color="secondary" size="sm" @click="checked[i] = !checked[i]">
          <VcCheckbox :model-value="checked[i]">Option {{ i + 1 }}</VcCheckbox>
        </VcMenuItem>
      </template>
    </VcDropdownMenu>

    <div class="h-52"></div>`,
  }),
};

export const WithRadioButton: StoryType = {
  render: (args) => ({
    components: { VcMenuItem, VcRadioButton, VcButton, VcDropdownMenu },
    setup: () => {
      const selected = ref("option1");
      const options = [
        { id: "option1", name: "Option 1" },
        { id: "option2", name: "Option 2" },
        { id: "option3", name: "Option 3" },
        { id: "option4", name: "Option 4" },
      ];

      function selectOption(id: string, close: () => void) {
        selected.value = id;
        close();
      }

      return { args, selected, options, selectOption };
    },
    template: `<VcDropdownMenu>
      <template #trigger="{ triggerProps }">
        <VcButton v-bind="triggerProps">Sort by</VcButton>
      </template>

      <template #content="{ close }">
        <VcMenuItem
          v-for="option in options"
          :key="option.id"
          color="secondary"
          size="sm"
          @click="selectOption(option.id, close)"
        >
          <VcRadioButton
            :model-value="selected"
            size="sm"
            :value="option.id"
            :label="option.name"
          />
        </VcMenuItem>
      </template>
    </VcDropdownMenu>

    <div class="h-52"></div>`,
  }),
};

export const AllStates: StoryType = {
  render: () => ({
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
  }),
};

export const CustomTokens: StoryType = {
  render: () => ({
    setup: () => ({ items: ["Inbox", "Drafts", "Archive"] }),
    template: `<div
      class="w-64 space-y-0.5 rounded-lg border border-neutral-200 bg-neutral-50 p-1 [--vc-menu-item-active-bg-color:var(--color-secondary-100)] [--vc-menu-item-bg-color:transparent] [--vc-menu-item-hover-bg-color:var(--color-neutral-100)] [--vc-menu-item-padding-x:0.625rem] [--vc-menu-item-radius:0.5rem]"
    >
      <VcMenuItem v-for="(item, index) in items" :key="item" :active="index === 0">
        {{ item }}
      </VcMenuItem>
    </div>`,
  }),
};
