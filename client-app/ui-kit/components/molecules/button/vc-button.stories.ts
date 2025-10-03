import { VcButton } from "..";
import { VcIcon } from "../../atoms";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xxs", "xs", "sm", "md", "lg"];
const COLORS = ["primary", "secondary", "success", "info", "neutral", "warning", "danger", "accent"];
const VARIANTS = ["solid", "outline", "no-border", "no-background", "solid-light"];
const TYPES = ["button", "reset", "submit"];

export default {
  title: "Components/Molecules/VcButton",
  component: VcButton,
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
    type: {
      control: "select",
      options: TYPES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: TYPES.join(" | "),
        },
      },
    },
    variant: {
      control: "select",
      options: VARIANTS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: VARIANTS.join(" | "),
        },
      },
    },
    onClick: { action: "VcButton click" },
  },
  // Default render function for most stories
  render: (args) => ({
    components: { VcButton },
    setup: () => ({ args }),
    template: '<VcButton v-bind="args" @click="args.onClick">Button text</VcButton>',
  }),
} as Meta<typeof VcButton>;

type StoryType = StoryObj<typeof VcButton>;

export const Basic: StoryType = {
  args: {},
};

export const Outline: StoryType = {
  args: {
    variant: "outline",
    color: "secondary",
  },
};

export const NoBorder: StoryType = {
  args: {
    variant: "no-border",
    color: "secondary",
  },
};

export const NoBackground: StoryType = {
  args: {
    variant: "no-background",
    color: "secondary",
  },
};

export const SolidLight: StoryType = {
  args: {
    variant: "solid-light",
    color: "secondary",
  },
};

export const FullWidth: StoryType = {
  args: {
    fullWidth: true,
  },
};

export const PrependIcon: StoryType = {
  args: {
    prependIcon: "save-v2",
  },
};

export const SlotPrependIcon: StoryType = {
  args: {},
  render: (args) => ({
    components: { VcButton, VcIcon },
    setup: () => ({ args }),
    template: `<VcButton v-bind="args">
      <VcIcon name="save-v2" />
      <span>Button text</span>
    </VcButton>`,
  }),
};

export const AppendIcon: StoryType = {
  args: {
    appendIcon: "save-v2",
  },
};

export const SlotAppendIcon: StoryType = {
  args: {},
  render: (args) => ({
    components: { VcButton, VcIcon },
    setup: () => ({ args }),
    template: `<VcButton v-bind="args">
      <span>Button text</span>
      <VcIcon name="save-v2" />
    </VcButton>`,
  }),
};

export const Icon: StoryType = {
  args: {
    icon: "save-v2",
    ariaLabel: "Save", // Add aria-label for accessibility
  },
  parameters: {
    a11y: {
      // Icon-only buttons need special attention for screen readers
      config: {
        rules: [
          {
            // Check for proper button name
            id: "button-name",
            enabled: true,
          },
        ],
      },
    },
  },
};

export const IconSize: StoryType = {
  args: {
    iconSize: "1.75rem",
    icon: "save-v2",
    ariaLabel: "Save", // Add aria-label for accessibility
  },
  parameters: {
    a11y: {
      // Same checks as Icon story
      config: {
        rules: [
          {
            id: "button-name",
            enabled: true,
          },
        ],
      },
    },
  },
};

export const SlotIcon: StoryType = {
  args: {
    icon: true,
    ariaLabel: "Save", // Add aria-label for accessibility
  },
  render: (args) => ({
    components: { VcButton, VcIcon },
    setup: () => ({ args }),
    template: `<VcButton v-bind="args">
      <VcIcon name="save-v2" />
    </VcButton>`,
  }),
  parameters: {
    a11y: {
      // Icon-only buttons need accessible labels
      config: {
        rules: [
          {
            id: "button-name",
            enabled: true,
          },
        ],
      },
    },
  },
};

export const Link: StoryType = {
  args: {
    to: "/some/link",
  },
};

export const ExternalLink: StoryType = {
  args: {
    externalLink: "https://virtocommerce.com",
    target: "_blank",
  },
};

export const RouterNavigation: StoryType = {
  render: () => ({
    components: { VcButton },
    setup: () => ({}),
    template: `
      <div class="space-y-4 p-6">
        <h2 class="text-xl font-bold">Router Navigation Test</h2>
        <p class="text-gray-600">Click the buttons below to test navigation:</p>

        <div class="flex flex-wrap gap-3">
          <VcButton to="/some/link" color="secondary" variant="outline">
            Some Link
          </VcButton>
          <VcButton to="/catalog" color="info" variant="solid">
            Catalog
          </VcButton>
          <VcButton to="/product/123" color="success" variant="outline">
            Product #123
          </VcButton>
          <VcButton to="/nonexistent" color="warning" variant="solid">
            Non-existent Page
          </VcButton>
        </div>

        <div class="mt-6 p-4 bg-gray-100 rounded">
          <h3 class="font-semibold mb-2">Current URL:</h3>
          <code class="text-sm">{{ $route.path }}</code>
        </div>
      </div>
    `,
  }),
};

export const Loading: StoryType = {
  args: {
    loading: true,
  },
};

export const Disabled: StoryType = {
  args: {
    disabled: true,
    appendIcon: "save-v2",
  },
  parameters: {
    a11y: {
      // Extra focus on disabled state accessibility
      config: {
        rules: [
          {
            // Check that disabled attribute is used correctly
            id: "aria-valid-attr-value",
            enabled: true,
          },
          {
            // Check that disabled buttons are not in tab order
            id: "focus-order-semantics",
            enabled: true,
          },
        ],
      },
    },
  },
};

export const MinWidth: StoryType = {
  args: {
    minWidth: "12rem",
  },
};

export const Truncate: StoryType = {
  args: {
    truncate: true,
    prependIcon: "save-v2",
  },
  render: (args) => ({
    components: { VcButton },
    setup: () => ({ args }),
    template: '<VcButton class="w-48" v-bind="args">Long long button text</VcButton>',
  }),
};

export const AllStates: StoryType = {
  render: () => ({
    components: { VcButton },
    setup: () => ({ colors: COLORS, variants: VARIANTS, sizes: SIZES }),
    template: `<div class="space-y-8">
      <div v-for="size in sizes" class="space-y-3">
        <h2 class="text-lg font-bold">Size: {{ size }}</h2>

        <div class="space-y-1" v-for="variant in variants">
          <div class="text-base">Variant: <b>{{ variant }}</b></div>

          <div class="flex flex-wrap gap-2 items-center">
            <VcButton v-for="color in colors" :size="size" :color="color" :variant="variant">
              Color: {{ color }}
            </VcButton>
          </div>
        </div>
      </div>
    </div>
    `,
  }),
};
