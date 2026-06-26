import { VcBadge, VcMarkdownRender } from "..";
import { VcAlert } from "../../molecules";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md", "lg"];
const COLORS = ["primary", "secondary", "success", "info", "neutral", "warning", "danger", "accent"];
const VARIANTS = ["solid", "soft", "outline", "surface", "ghost", "tonal"];

export default {
  title: "Components/Atoms/VcBadge",
  component: VcBadge,
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
    variant: {
      control: "select",
      options: VARIANTS,
      description:
        "Visual style. Deprecated aliases (still supported, emit a one-time dev warning): `solid-light` → `soft`, `outline-dark` → `tonal`.",
      type: { name: "string", required: false },
      table: {
        type: {
          summary: VARIANTS.join(" | "),
        },
      },
    },
  },
  render: (args) => ({
    components: { VcBadge },
    setup: () => ({ args }),
    template: '<VcBadge v-bind="args">35</VcBadge>',
  }),
} as Meta<typeof VcBadge>;

const renderTemplate = (template: string) => (args: Record<string, unknown>) => ({
  components: { VcBadge },
  setup: () => ({ args }),
  template,
});

export const Basic: StoryObj = {};

export const Soft: StoryObj = {
  args: {
    variant: "soft",
  },
};

export const Outline: StoryObj = {
  args: {
    variant: "outline",
  },
};

export const Surface: StoryObj = {
  args: {
    variant: "surface",
  },
};

export const Ghost: StoryObj = {
  args: {
    variant: "ghost",
  },
};

export const Tonal: StoryObj = {
  args: {
    variant: "tonal",
  },
};

export const Rounded: StoryObj = {
  args: {
    rounded: true,
  },
};

export const Truncate: StoryObj = {
  args: {
    truncate: true,
  },
  render: renderTemplate(`
    <div class="flex gap-4">
      <VcBadge class="w-32" v-bind="args">Long long long long badge text</VcBadge>

      <VcBadge class="w-32" v-bind="args">
        <VcIcon name="round-check" />
        <span>Long long long long badge text</span>
      </VcBadge>
    </div>
  `),
};

export const Nowrap: StoryObj = {
  args: {
    nowrap: true,
  },
  render: renderTemplate('<VcBadge v-bind="args">Long long long long badge text</VcBadge>'),
};

export const MaxWidth: StoryObj = {
  args: {
    maxWidth: "8rem",
  },
  render: renderTemplate('<VcBadge v-bind="args">Very long badge text that should be constrained</VcBadge>'),
};

export const WithIcon: StoryObj = {
  render: renderTemplate(`<VcBadge v-bind="args">
    <VcIcon name="round-check" />
    <span>35</span>
  </VcBadge>`),
};

export const WithIcons: StoryObj = {
  render: renderTemplate(`<VcBadge v-bind="args">
    <VcIcon name="round-check" />
    <span>35</span>
    <VcIcon name="round-check" />
  </VcBadge>`),
};

export const OnlyIcon: StoryObj = {
  args: {
    square: true,
  },
  render: renderTemplate('<VcBadge v-bind="args"><VcIcon name="fire" /></VcBadge>'),
};

export const Dot: StoryObj = {
  render: renderTemplate(`<VcBadge />`),
};

export const AllSizes: StoryObj = {
  render: () => ({
    components: { VcBadge },
    setup: () => ({ sizes: SIZES }),
    template: `<div class="space-y-4">
      <div v-for="size in sizes" class="flex items-center gap-4">
        <span class="w-8 text-sm">{{ size }}:</span>
        <VcBadge :size="size">35</VcBadge>
        <VcBadge :size="size" rounded>35</VcBadge>
        <VcBadge :size="size" square>
          <VcIcon name="fire" />
        </VcBadge>
        <VcBadge :size="size" />
      </div>
    </div>`,
  }),
};

export const AllColors: StoryObj = {
  render: () => ({
    setup: () => ({ colors: COLORS }),
    template: `<div class="space-y-4">
      <div v-for="color in colors" class="flex items-center gap-4">
        <span class="w-20 text-sm">{{ color }}:</span>
        <VcBadge :color="color">35</VcBadge>
        <VcBadge :color="color" variant="soft">35</VcBadge>
        <VcBadge :color="color" variant="outline">35</VcBadge>
        <VcBadge :color="color" variant="surface">35</VcBadge>
        <VcBadge :color="color" variant="ghost">35</VcBadge>
        <VcBadge :color="color" variant="tonal">35</VcBadge>
      </div>
    </div>`,
  }),
};

export const AllStates: StoryObj = {
  render: () => ({
    setup: () => ({ colors: COLORS, variants: VARIANTS, sizes: SIZES }),
    template: `<div class="space-y-6">
      <div v-for="size in sizes" class="space-y-6">
        <h2 class="text-lg font-bold">Size: {{ size }}</h2>

        <div class="flex flex-wrap gap-1" v-for="variant in variants">
          <div class="w-28 text-xs">Variant: <b>{{ variant }}</b></div>

          <div class="space-y-2">
            <div class="flex justify-around flex-wrap gap-1">
              <VcBadge v-for="color in colors" :size="size" :color="color" :variant="variant">
                <VcIcon name="cloud" />
                Color: {{ color }}
              </VcBadge>
            </div>

            <div class="flex justify-around flex-wrap gap-1">
              <VcBadge v-for="color in colors" :size="size" :color="color" :variant="variant" rounded>
                <VcIcon name="cloud" />
                Color: {{ color }}
              </VcBadge>
            </div>

            <div class="flex justify-around flex-wrap gap-1">
              <VcBadge v-for="color in colors" :size="size" :color="color" :variant="variant">
                Color: {{ color }}
              </VcBadge>
            </div>

            <div class="flex justify-around flex-wrap gap-1">
              <VcBadge v-for="color in colors" :size="size" :color="color" :variant="variant" rounded>
                Color: {{ color }}
              </VcBadge>
            </div>

            <div class="flex justify-around flex-wrap gap-1">
              <VcBadge v-for="color in colors" :size="size" :color="color" :variant="variant" square>
                <VcIcon name="cloud" />
              </VcBadge>
            </div>

            <div class="flex justify-around flex-wrap gap-1">
              <VcBadge v-for="color in colors" :size="size" :color="color" :variant="variant" square rounded>
                <VcIcon name="cloud" />
              </VcBadge>
            </div>

            <div class="flex justify-around flex-wrap gap-1">
              <VcBadge v-for="color in colors" :color="color" :variant="variant" :size="size" />
            </div>

            <div class="flex justify-around flex-wrap gap-1">
              <VcBadge v-for="color in colors" :color="color" :variant="variant" :size="size" rounded />
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
  }),
};

const DEPRECATED_VARIANTS = [
  { legacy: "solid-light", canonical: "soft" },
  { legacy: "outline-dark", canonical: "tonal" },
] as const;

const DEPRECATED_VARIANTS_MESSAGE =
  "Deprecated `variant` aliases are kept for backward compatibility and resolve to their canonical names at runtime (emitting a one-time dev console warning): `solid-light` → **soft**, `outline-dark` → **tonal**. Each row below shows the deprecated alias next to its canonical replacement — they render identically. Prefer the canonical names in new code.";

export const Deprecations: StoryObj = {
  tags: ["deprecated"],
  parameters: {
    docs: {
      description: {
        story: DEPRECATED_VARIANTS_MESSAGE,
      },
    },
  },
  render: () => ({
    components: { VcBadge, VcAlert, VcMarkdownRender },
    setup: () => ({ pairs: DEPRECATED_VARIANTS, message: DEPRECATED_VARIANTS_MESSAGE }),
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
          <VcBadge :variant="pair.legacy">35</VcBadge>
        </div>
        <div class="text-neutral-400">→</div>
        <div class="space-y-1">
          <div class="text-xs text-neutral-500">canonical: <code>{{ pair.canonical }}</code></div>
          <VcBadge :variant="pair.canonical">35</VcBadge>
        </div>
      </div>
    </div>
    `,
  }),
};
