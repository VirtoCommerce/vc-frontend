import { VcBadge } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["xs", "sm", "md"];
const COLORS = ["primary", "secondary", "success", "info", "neutral", "warning", "danger"];
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
          summary: '"xs" | "sm" | "md"',
        },
      },
    },
    color: {
      control: "select",
      options: COLORS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: '"primary" | "secondary" | "success" | "info" | "neutral" | "warning" | "danger"',
        },
      },
    },
    variant: {
      control: "select",
      options: VARIANTS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: '"solid" | "solid-light" | "outline" | "outline-dark"',
        },
      },
    },
  },
} as Meta<typeof VcBadge>;

const Template: StoryFn<typeof VcBadge> = (args) => ({
  components: { VcBadge },
  setup: () => ({ args }),
  template: '<VcBadge v-bind="args">Badge</VcBadge>',
});

export const Basic = Template.bind({});

export const SolidLight = Template.bind({});
SolidLight.args = {
  variant: "solid-light",
};

export const Outline = Template.bind({});
Outline.args = {
  variant: "outline",
};

export const OutlineDark = Template.bind({});
OutlineDark.args = {
  variant: "outline-dark",
};

export const AllStates: StoryFn<typeof VcBadge> = () => ({
  components: { VcBadge },
  setup: () => ({ colors: COLORS, variants: VARIANTS, sizes: SIZES }),
  template: `<div class="space-y-6">
    <div v-for="size in sizes" class="space-y-2">
      <h2 class="text-lg font-bold">Size: {{ size }}</h2>

      <div class="flex flex-wrap gap-1 items-center" v-for="variant in variants">
        <div class="w-32 text-xs">Variant: <b>{{ variant }}</b></div>

        <VcBadge v-for="color in colors" :size="size" :color="color" :variant="variant">
          Color: {{ color }}
        </VcBadge>
      </div>
    </div>
  </div>
  `,
});
