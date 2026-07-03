import { VcButton, VcAlert } from "..";
import { VcIcon, VcMarkdownRender } from "../../atoms";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xxs", "xs", "sm", "md", "lg"];
const COLORS = ["primary", "secondary", "success", "info", "neutral", "warning", "danger", "accent"];
const VARIANTS = ["solid", "outline", "surface", "ghost", "soft", "tonal"];
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
      description:
        "Visual style. Deprecated aliases (still supported, emit a dev warning): `no-border` → `surface`, `no-background` → `ghost`, `solid-light` → `soft`.",
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

export const Surface: StoryType = {
  args: {
    variant: "surface",
    color: "secondary",
  },
};

export const Ghost: StoryType = {
  args: {
    variant: "ghost",
    color: "secondary",
  },
};

export const Soft: StoryType = {
  args: {
    variant: "soft",
    color: "secondary",
  },
};

export const Tonal: StoryType = {
  args: {
    variant: "tonal",
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
    ariaLabel: "Button text",
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

export const AllVariants: StoryType = {
  args: {
    size: "md",
    color: "primary",
  },
  render: (args) => ({
    components: { VcButton },
    setup: () => ({ variants: VARIANTS, args }),
    template: `<div class="space-y-8">
      <div class="space-y-1" v-for="variant in variants">
        <VcButton v-bind="args" :variant="variant">
          {{ variant }}
        </VcButton>
      </div>
    </div>
    `,
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

const DEPRECATED_VARIANTS = [
  { legacy: "no-border", canonical: "surface" },
  { legacy: "no-background", canonical: "ghost" },
  { legacy: "solid-light", canonical: "soft" },
] as const;

const DEPRECATED_VARIANTS_MESSAGE =
  "Deprecated `variant` aliases are kept for backward compatibility and resolve to their canonical names at runtime (emitting a one-time dev console warning): `solid-light` → **soft**, `no-border` → **surface**, `no-background` → **ghost**. Each row below shows the deprecated alias next to its canonical replacement — they render identically. Prefer the canonical names in new code.";

export const Deprecations: StoryType = {
  tags: ["deprecated"],
  args: {
    size: "md",
    color: "primary",
  },
  parameters: {
    docs: {
      description: {
        story: DEPRECATED_VARIANTS_MESSAGE,
      },
    },
  },
  render: (args) => ({
    components: { VcButton, VcAlert, VcMarkdownRender },
    setup: () => ({ pairs: DEPRECATED_VARIANTS, message: DEPRECATED_VARIANTS_MESSAGE, args }),
    template: `<div class="space-y-6">
      <VcAlert color="warning" variant="outline" icon title="Deprecated">
        <VcMarkdownRender :src="message" />
      </VcAlert>

      <div
        class="grid grid-cols-[1fr_auto_1fr] gap-4 items-center"
        v-for="pair in pairs"
        :key="pair.legacy"
      >
        <div class="space-y-1">
          <div class="text-xs text-neutral-500">deprecated: <code>{{ pair.legacy }}</code></div>
          <VcButton v-bind="args" :variant="pair.legacy">{{ pair.legacy }}</VcButton>
        </div>
        <div class="text-neutral-400">→</div>
        <div class="space-y-1">
          <div class="text-xs text-neutral-500">canonical: <code>{{ pair.canonical }}</code></div>
          <VcButton v-bind="args" :variant="pair.canonical">{{ pair.canonical }}</VcButton>
        </div>
      </div>
    </div>
    `,
  }),
};
