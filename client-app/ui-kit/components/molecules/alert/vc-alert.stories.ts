import { VcAlert } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const COLORS = ["info", "success", "warning", "danger"];
const VARIANTS = ["solid", "solid-light", "outline", "outline-dark"];
const SIZES = ["sm", "md"];

export default {
  title: "Components/Molecules/VcAlert",
  component: VcAlert,
  argTypes: {
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
  },
  render: (args) => ({
    components: { VcAlert },
    setup: () => ({ args }),
    template: `<VcAlert v-bind="args">
      Lorem praesentium natus cumque tenetur iusto sequi sit repellat! Temporibus tempora fugit vel amet voluptates ipsam Quidem quos repellat at ut earum velit Vero totam voluptates nesciunt eveniet delectus. Quas.
    </VcAlert>`,
  }),
} as Meta<typeof VcAlert>;

type StoryType = StoryObj<typeof VcAlert>;

export const Basic: StoryType = {
  args: {},
};

export const Title: StoryType = {
  args: {
    title: "Alert",
  },
};

export const Outline: StoryType = {
  args: {
    variant: "outline",
  },
};

export const Icon: StoryType = {
  args: {
    icon: true,
  },
};

export const Shadow: StoryType = {
  args: {
    shadow: true,
  },
};

export const Closable: StoryType = {
  args: {
    closable: true,
  },
};

export const AllStates: StoryType = {
  render: () => ({
    components: { VcAlert },
    setup: () => ({ colors: COLORS, variants: VARIANTS, sizes: SIZES }),
    template: `<div class="space-y-6">
      <div v-for="size in sizes" class="space-y-6">
        <div class="text-sm font-bold border-b">Size: {{ size }}</div>

        <div class="flex flex-wrap gap-1 items-center" v-for="variant in variants">
          <div class="w-32 text-xs">Variant: <b>{{ variant }}</b></div>

          <div class="grow space-y-1">
            <VcAlert v-for="color in colors" :color="color" :variant="variant" :size="size" icon closable>
              Color: {{ color }}
            </VcAlert>
          </div>
        </div>
      </div>
    </div>`,
  }),
};
