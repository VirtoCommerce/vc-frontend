import { VcChip } from "..";
import { VcIcon } from "../../atoms";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["xs", "sm", "md", "lg"];
const COLORS = ["primary", "secondary", "success", "info", "neutral", "warning", "danger"];
const VARIANTS = ["solid", "solid-light", "outline", "outline-dark"];

export default {
  title: "Components/Molecules/VcChip",
  component: VcChip,
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
} as Meta<typeof VcChip>;

const Template: StoryFn<typeof VcChip> = (args) => ({
  components: { VcChip },
  setup: () => ({ args }),
  template: '<VcChip v-bind="args">Chip text</VcChip>',
});

export const Basic = Template.bind({});

export const Rounded = Template.bind({});
Rounded.args = {
  rounded: true,
};

export const Closable = Template.bind({});
Closable.args = {
  closable: true,
};

export const Clickable = Template.bind({});
Clickable.args = {
  clickable: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const Icon = Template.bind({});
Icon.args = {
  icon: "cog",
};

export const IconInSlot: StoryFn<typeof VcChip> = (args) => ({
  components: { VcChip, VcIcon },
  setup: () => ({ args }),
  template: `<VcChip v-bind="args">
    <VcIcon name="cog" />
    <span>Chip text</span>
  </VcChip>`,
});

export const Truncate: StoryFn<typeof VcChip> = (args) => ({
  components: { VcChip },
  setup: () => ({ args }),
  template: `<VcChip v-bind="args" class="w-36">
    <span>Long long long Chip text</span>
  </VcChip>`,
});
Truncate.args = {
  truncate: true,
};

export const AllStates: StoryFn<typeof VcChip> = () => ({
  components: { VcChip },
  setup: () => ({ colors: COLORS, variants: VARIANTS, sizes: SIZES }),
  template: `<div class="space-y-8">
    <div v-for="size in sizes" class="space-y-3">
      <h2 class="text-lg font-bold">Size: {{ size }}</h2>

      <div class="space-y-1" v-for="variant in variants">
        <div class="text-base">Variant: <b>{{ variant }}</b></div>

        <div class="flex flex-wrap gap-2 items-center">
          <VcChip v-for="color in colors" :size="size" :color="color" :variant="variant">
            Color: {{ color }}
          </VcChip>
        </div>
      </div>
    </div>

    <div v-for="size in sizes" class="space-y-3">
      <h2 class="text-lg font-bold">Size: {{ size }}</h2>


      <div class="space-y-1" v-for="variant in variants">
        <div class="text-base">Variant: <b>{{ variant }}</b></div>

        <div class="flex flex-wrap gap-2 items-center">
          <VcChip v-for="color in colors" :size="size" :color="color" :variant="variant" closable>
            Color: {{ color }}
          </VcChip>
        </div>
      </div>
    </div>
  </div>
  `,
});
