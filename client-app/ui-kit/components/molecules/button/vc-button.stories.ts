import { VcButton } from "..";
import { VcIcon } from "../../atoms";
import type { Meta, StoryFn } from "@storybook/vue3";

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
} as Meta<typeof VcButton>;

const Template: StoryFn = (args) => ({
  components: { VcButton },
  setup: () => ({ args }),
  template: '<VcButton v-bind="args" @click="args.onClick">Button text</VcButton>',
});

export const Basic = Template.bind({});

export const Outline = Template.bind({});
Outline.args = {
  variant: "outline",
  color: "secondary",
};

export const NoBorder = Template.bind({});
NoBorder.args = {
  variant: "no-border",
  color: "secondary",
};

export const NoBackground = Template.bind({});
NoBackground.args = {
  variant: "no-background",
  color: "secondary",
};

export const SolidLight = Template.bind({});
SolidLight.args = {
  variant: "solid-light",
  color: "secondary",
};

export const FullWidth = Template.bind({});
FullWidth.args = {
  fullWidth: true,
};

export const PrependIcon = Template.bind({});
PrependIcon.args = {
  prependIcon: "save-v2",
};

export const SlotPrependIcon: StoryFn = (args) => ({
  components: { VcButton, VcIcon },
  setup: () => ({ args }),
  template: `<VcButton v-bind="args">
    <VcIcon name="save-v2" />
    <span>Button text</span>
  </VcButton>`,
});

export const AppendIcon = Template.bind({});
AppendIcon.args = {
  appendIcon: "save-v2",
};

export const SlotAppendIcon: StoryFn = (args) => ({
  components: { VcButton, VcIcon },
  setup: () => ({ args }),
  template: `<VcButton v-bind="args">
    <span>Button text</span>
    <VcIcon name="save-v2" />
  </VcButton>`,
});

export const Icon = Template.bind({});
Icon.args = {
  icon: "save-v2",
};

export const IconSize = Template.bind({});
IconSize.args = {
  iconSize: "1.75rem",
  icon: "save-v2",
};

export const SlotIcon: StoryFn = (args) => ({
  components: { VcButton, VcIcon },
  setup: () => ({ args }),
  template: `<VcButton v-bind="args">
    <VcIcon name="save-v2" />
  </VcButton>`,
});
SlotIcon.args = {
  icon: true,
};

export const Link = Template.bind({});
Link.args = {
  to: "/some/link",
};

export const ExternalLink = Template.bind({});
ExternalLink.args = {
  externalLink: "https://virtocommerce.com",
};

export const Loading = Template.bind({});
Loading.args = {
  loading: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  appendIcon: "save-v2",
};

export const MinWidth = Template.bind({});
MinWidth.args = {
  minWidth: "12rem",
};

export const Truncate: StoryFn = (args) => ({
  components: { VcButton },
  setup: () => ({ args }),
  template: '<VcButton class="w-48" v-bind="args">Long long button text</VcButton>',
});
Truncate.args = {
  truncate: true,
  prependIcon: "save-v2",
};

export const AllStates: StoryFn = () => ({
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
