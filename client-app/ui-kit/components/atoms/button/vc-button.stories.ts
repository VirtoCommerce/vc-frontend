import { VcButton, VcIcon } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["xs", "sm", "md", "lg"];
const COLORS = ["primary", "secondary", "success", "info", "neutral", "warning", "danger"];
const VARIANTS = ["solid", "outline"];

export default {
  title: "Components/Atoms/VcButton",
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
} as Meta<typeof VcButton>;

const Template: StoryFn<typeof VcButton> = (args) => ({
  components: { VcButton, VcIcon },
  setup: () => ({ args }),
  template: '<VcButton v-bind="args">Button text</VcButton>',
});

export const Basic = Template.bind({});

export const Outline = Template.bind({});
Outline.args = {
  variant: "outline",
  color: "secondary",
};

export const FullWidth = Template.bind({});
FullWidth.args = {
  fullWidth: true,
};

export const PrependIcon = Template.bind({});
PrependIcon.args = {
  variant: "outline",
  color: "secondary",
  prependIcon: "save-v2",
};

export const AppendIcon = Template.bind({});
AppendIcon.args = {
  variant: "outline",
  color: "secondary",
  appendIcon: "save-v2",
};

export const Icon = Template.bind({});
Icon.args = {
  variant: "outline",
  color: "secondary",
  icon: "save-v2",
};

export const Truncate: StoryFn<typeof VcButton> = (args) => ({
  components: { VcButton },
  setup: () => ({ args }),
  template: '<VcButton class="w-48" v-bind="args">Long long button text</VcButton>',
});
Truncate.args = {
  truncate: true,
  prependIcon: "save-v2",
};

export const AllStates: StoryFn<typeof VcButton> = () => ({
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
});
