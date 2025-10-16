import { VcBadge } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md", "lg"];
const COLORS = ["primary", "secondary", "success", "info", "neutral", "warning", "danger", "accent"];
const VARIANTS = ["solid", "solid-light", "outline", "outline-dark"];

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

export const SolidLight: StoryObj = {
  args: {
    variant: "solid-light",
  },
};

export const Outline: StoryObj = {
  args: {
    variant: "outline",
  },
};

export const OutlineDark: StoryObj = {
  args: {
    variant: "outline-dark",
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
  render: renderTemplate('<VcBadge class="w-32" v-bind="args">Long long long long badge text</VcBadge>'),
};

export const Nowrap: StoryObj = {
  args: {
    nowrap: true,
  },
  render: renderTemplate('<VcBadge class="w-32" v-bind="args">Long long long long badge text</VcBadge>'),
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
        <VcBadge :color="color" variant="solid-light">35</VcBadge>
        <VcBadge :color="color" variant="outline">35</VcBadge>
        <VcBadge :color="color" variant="outline-dark">35</VcBadge>
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
                <VcIcon name="fire" />
                Color: {{ color }}
              </VcBadge>
            </div>

            <div class="flex justify-around flex-wrap gap-1">
              <VcBadge v-for="color in colors" :size="size" :color="color" :variant="variant" rounded>
                <VcIcon name="fire" />
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
                <VcIcon name="fire" />
              </VcBadge>
            </div>

            <div class="flex justify-around flex-wrap gap-1">
              <VcBadge v-for="color in colors" :size="size" :color="color" :variant="variant" square rounded>
                <VcIcon name="fire" />
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
