import { VcChip } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["sm", "md", "lg"];
const COLORS = ["primary", "secondary", "success", "info", "neutral", "warning", "danger", "accent"];
const VARIANTS = ["solid", "solid-light", "outline", "outline-dark"];

const meta: Meta<typeof VcChip> = {
  title: "Components/Molecules/VcChip",
  component: VcChip,
  argTypes: {
    size: {
      control: "inline-radio",
      options: SIZES,
      type: { name: "string", required: false },
      table: { type: { summary: SIZES.join(" | ") } },
    },
    color: {
      control: "select",
      options: COLORS,
      type: { name: "string", required: false },
      table: { type: { summary: COLORS.join(" | ") } },
    },
    variant: {
      control: "select",
      options: VARIANTS,
      type: { name: "string", required: false },
      table: { type: { summary: VARIANTS.join(" | ") } },
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcChip v-bind="args">Chip text</VcChip>',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = { args: {} };

export const Rounded: StoryType = {
  args: { rounded: true },
};

export const Closable: StoryType = {
  args: { closable: true },
};

export const Clickable: StoryType = {
  args: { clickable: true },
};

export const Disabled: StoryType = {
  args: { disabled: true },
};

export const Icon: StoryType = {
  args: { icon: "circle-solid" },
};

export const IconInSlot: StoryType = {
  args: {},
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcChip v-bind="args">
      <VcIcon name="circle-solid" />
      <span>Chip text</span>
    </VcChip>`,
  }),
};

export const IconColorPallette: StoryType = {
  args: {
    variant: "outline",
    icon: "circle-solid",
    iconColor: "secondary",
  },
};

export const IconColorHEX: StoryType = {
  args: {
    variant: "outline",
    icon: "circle-solid",
    iconColor: "#ff0000",
  },
};

export const Truncate: StoryType = {
  args: { truncate: true },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcChip v-bind="args" class="w-36">
      <span>Long long long Chip text</span>
    </VcChip>`,
  }),
};

export const RouterLink: StoryType = {
  args: {
    clickable: true,
    to: "/",
    icon: "link",
  },
};

export const ExternalLink: StoryType = {
  args: {
    clickable: true,
    externalLink: "https://example.com",
    target: "_blank",
    icon: "external-link",
  },
};

export const WithActions: StoryType = {
  args: {
    closable: true,
    clickable: true,
  },
  render: (args) => ({
    setup: () => ({
      args,
      handleClick: () => console.log("click event fired"),
      handleClose: () => console.log("close event fired"),
    }),
    template: `<VcChip v-bind="args" @click="handleClick" @close="handleClose">
      Chip with actions
    </VcChip>`,
  }),
};

export const Draggable: StoryType = {
  args: {
    draggable: true,
  },
};

export const ClosableClickable: StoryType = {
  args: {
    closable: true,
    clickable: true,
  },
};

export const DisabledClosable: StoryType = {
  args: {
    disabled: true,
    closable: true,
  },
};

export const CustomCloseIcon: StoryType = {
  args: {
    closable: true,
  },
  render: (args) => ({
    setup: () => ({
      args,
      handleClose: () => console.log("close event fired with custom icon"),
    }),
    template: `<VcChip v-bind="args" @close="handleClose">
      Custom close
      <template #close-icon>
        <VcIcon name="delete" />
      </template>
    </VcChip>`,
  }),
};

export const AllVariants: StoryType = {
  args: {
    size: "md",
    color: "primary",
  },
  render: (args) => ({
    setup: () => ({ variants: VARIANTS, args }),
    template: `<div class="flex flex-col items-start gap-3">
      <VcChip v-bind="args" v-for="variant in variants" :variant="variant" icon="circle-solid" closable>
        {{ variant }}
      </VcChip>
    </div>`,
  }),
};

export const AllStates: StoryType = {
  render: () => ({
    setup: () => ({ colors: COLORS, variants: VARIANTS, sizes: SIZES }),
    template: `<div class="space-y-8">
      <div v-for="size in sizes" class="space-y-3">
        <h2 class="text-lg font-bold">Size: {{ size }}</h2>

        <div class="space-y-1" v-for="variant in variants">
          <div class="text-base">Variant: <b>{{ variant }}</b></div>

          <div class="flex flex-wrap gap-2 items-center">
            <VcChip v-for="color in colors" :size="size" :color="color" :variant="variant" icon="circle-solid">
              Color: {{ color }}
            </VcChip>

            <VcChip :size="size" :variant="variant" icon="circle-solid" disabled>
              Color: Disabled
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

            <VcChip :size="size" :variant="variant" icon="circle-solid" disabled closable>
              Color: Disabled
            </VcChip>
          </div>
        </div>
      </div>
    </div>`,
  }),
};
