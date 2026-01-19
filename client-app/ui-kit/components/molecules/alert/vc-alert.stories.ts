import { VcAlert } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const COLORS = ["info", "success", "warning", "danger"];
const VARIANTS = ["solid", "solid-light", "outline", "outline-dark"];
const SIZES = ["sm", "md"];

const meta: Meta<typeof VcAlert> = {
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
};

export default meta;
type StoryType = StoryObj<typeof meta>;

// 1. Basic examples
export const Basic: StoryType = { args: {} };

export const WithTitle: StoryType = { args: { title: "Alert" } };

// 2. Variants
export const VariantSolidLight: StoryType = {
  args: { variant: "solid-light" },
};

export const VariantOutline: StoryType = { args: { variant: "outline" } };

export const VariantOutlineDark: StoryType = {
  args: { variant: "outline-dark" },
};

// 3. Sizes
export const SizeSm: StoryType = { args: { size: "sm" } };

// 4. Colors
export const ColorInfo: StoryType = { args: { color: "info" } };

export const ColorSuccess: StoryType = { args: { color: "success" } };

export const ColorWarning: StoryType = { args: { color: "warning" } };

export const ColorDanger: StoryType = { args: { color: "danger" } };

// 5. Icons
export const IconAuto: StoryType = { args: { icon: true } };

export const IconCustom: StoryType = {
  args: { icon: "cog" },
};

export const SlotMainIcon: StoryType = {
  args: { icon: false },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcAlert v-bind="args">
      <template #main-icon>
        <VcIcon name="cart" />
      </template>
      Custom main icon via slot
    </VcAlert>`,
  }),
};

export const SlotCloseIcon: StoryType = {
  args: { closable: true },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcAlert v-bind="args">
      <template #close-icon>
        <VcIcon name="delete" />
      </template>
      Custom close icon via slot
    </VcAlert>`,
  }),
};

// 6. Shadow & Closable
export const WithShadow: StoryType = { args: { shadow: true } };

export const Closable: StoryType = {
  args: { closable: true },
  parameters: { actions: { handles: ["close"] } },
};

// 7. Kitchen sink
export const AllStates: StoryType = {
  render: () => ({
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
