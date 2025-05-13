import { VcBadge } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["sm", "md", "lg"];
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
} as Meta<typeof VcBadge>;

const Template: StoryFn = (args) => ({
  components: { VcBadge },
  setup: () => ({ args }),
  template: '<VcBadge v-bind="args">35</VcBadge>',
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

export const Rounded = Template.bind({});
Rounded.args = {
  rounded: true,
};

export const Truncate: StoryFn = (args) => ({
  components: { VcBadge },
  setup: () => ({ args }),
  template: '<VcBadge class="w-32" v-bind="args">Long long long long badge text</VcBadge>',
});
Truncate.args = {
  truncate: true,
};

export const Icon: StoryFn = (args) => ({
  components: { VcBadge },
  setup: () => ({ args }),
  template: `<VcBadge v-bind="args">
    <VcIcon name="fire" />
    <span>35</span>
  </VcBadge>`,
});
Truncate.args = {
  truncate: true,
};

export const Dot: StoryFn = () => ({
  components: { VcBadge },
  template: "<VcBadge />",
});

export const AllStates: StoryFn = () => ({
  components: { VcBadge },
  setup: () => ({ colors: COLORS, variants: VARIANTS, sizes: SIZES }),
  template: `<div class="space-y-6">
    <div v-for="size in sizes" class="space-y-6">
      <h2 class="text-lg font-bold">Size: {{ size }}</h2>

      <div class="flex flex-wrap gap-1" v-for="variant in variants">
        <div class="w-28 text-xs">Variant: <b>{{ variant }}</b></div>

        <div class="space-y-2">
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
});
