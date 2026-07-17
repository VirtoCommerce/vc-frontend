import { VcAlert } from "..";
import { VcMarkdownRender } from "../../atoms";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const COLORS = ["info", "success", "warning", "danger"];
const VARIANTS = ["solid", "soft", "outline", "tonal"];
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
      description:
        "Visual style. Deprecated aliases (still supported, emit a one-time dev warning): `solid-light` → `soft`, `outline-dark` → `tonal`.",
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
export const Basic: StoryType = {
  args: {},
  parameters: {
    docs: {
      source: {
        code: `
          <VcAlert>
            Lorem praesentium natus cumque tenetur iusto sequi sit repellat! Temporibus tempora fugit vel amet voluptates ipsam Quidem quos repellat at ut earum velit Vero totam voluptates nesciunt eveniet delectus. Quas.
          </VcAlert>
        `,
      },
    },
  },
};

export const WithTitle: StoryType = {
  args: { title: "Alert" },
  parameters: {
    docs: {
      source: {
        code: `
          <VcAlert title="Alert">
            Lorem praesentium natus cumque tenetur iusto sequi sit repellat! Temporibus tempora fugit vel amet voluptates ipsam Quidem quos repellat at ut earum velit Vero totam voluptates nesciunt eveniet delectus. Quas.
          </VcAlert>
        `,
      },
    },
  },
};

// 2. Variants
export const VariantSoft: StoryType = {
  args: { variant: "soft" },
};

export const VariantOutline: StoryType = {
  args: { variant: "outline" },
};

export const VariantTonal: StoryType = {
  args: { variant: "tonal" },
};

// 3. Sizes
export const SizeSm: StoryType = {
  args: { size: "sm" },
  parameters: {
    docs: {
      source: {
        code: `
          <VcAlert size="sm">
            Lorem praesentium natus cumque tenetur iusto sequi sit repellat! Temporibus tempora fugit vel amet voluptates ipsam Quidem quos repellat at ut earum velit Vero totam voluptates nesciunt eveniet delectus. Quas.
          </VcAlert>
        `,
      },
    },
  },
};

// 4. Colors
export const ColorInfo: StoryType = {
  args: { color: "info" },
  parameters: {
    docs: {
      source: {
        code: `
          <VcAlert color="info">
            Lorem praesentium natus cumque tenetur iusto sequi sit repellat! Temporibus tempora fugit vel amet voluptates ipsam Quidem quos repellat at ut earum velit Vero totam voluptates nesciunt eveniet delectus. Quas.
          </VcAlert>
        `,
      },
    },
  },
};

export const ColorSuccess: StoryType = {
  args: { color: "success" },
  parameters: {
    docs: {
      source: {
        code: `
          <VcAlert color="success">
            Lorem praesentium natus cumque tenetur iusto sequi sit repellat! Temporibus tempora fugit vel amet voluptates ipsam Quidem quos repellat at ut earum velit Vero totam voluptates nesciunt eveniet delectus. Quas.
          </VcAlert>
        `,
      },
    },
  },
};

export const ColorWarning: StoryType = {
  args: { color: "warning" },
  parameters: {
    docs: {
      source: {
        code: `
          <VcAlert color="warning">
            Lorem praesentium natus cumque tenetur iusto sequi sit repellat! Temporibus tempora fugit vel amet voluptates ipsam Quidem quos repellat at ut earum velit Vero totam voluptates nesciunt eveniet delectus. Quas.
          </VcAlert>
        `,
      },
    },
  },
};

export const ColorDanger: StoryType = {
  args: { color: "danger" },
  parameters: {
    docs: {
      source: {
        code: `
          <VcAlert color="danger">
            Lorem praesentium natus cumque tenetur iusto sequi sit repellat! Temporibus tempora fugit vel amet voluptates ipsam Quidem quos repellat at ut earum velit Vero totam voluptates nesciunt eveniet delectus. Quas.
          </VcAlert>
        `,
      },
    },
  },
};

// 5. Icons
export const IconAuto: StoryType = {
  args: { icon: true },
  parameters: {
    docs: {
      source: {
        code: `
          <VcAlert icon>
            Lorem praesentium natus cumque tenetur iusto sequi sit repellat! Temporibus tempora fugit vel amet voluptates ipsam Quidem quos repellat at ut earum velit Vero totam voluptates nesciunt eveniet delectus. Quas.
          </VcAlert>
        `,
      },
    },
  },
};

export const IconCustom: StoryType = {
  args: { icon: "cog" },
  parameters: {
    docs: {
      source: {
        code: `
          <VcAlert icon="cog">
            Lorem praesentium natus cumque tenetur iusto sequi sit repellat! Temporibus tempora fugit vel amet voluptates ipsam Quidem quos repellat at ut earum velit Vero totam voluptates nesciunt eveniet delectus. Quas.
          </VcAlert>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
          <VcAlert>
            <template #main-icon>
              <VcIcon name="cart" />
            </template>
            Custom main icon via slot
          </VcAlert>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
          <VcAlert closable>
            <template #close-icon>
              <VcIcon name="delete" />
            </template>
            Custom close icon via slot
          </VcAlert>
        `,
      },
    },
  },
};

// 6. Shadow & Closable
export const WithShadow: StoryType = {
  args: { shadow: true },
  parameters: {
    docs: {
      source: {
        code: `
          <VcAlert shadow>
            Lorem praesentium natus cumque tenetur iusto sequi sit repellat! Temporibus tempora fugit vel amet voluptates ipsam Quidem quos repellat at ut earum velit Vero totam voluptates nesciunt eveniet delectus. Quas.
          </VcAlert>
        `,
      },
    },
  },
};

export const Closable: StoryType = {
  args: { closable: true },
  parameters: {
    actions: { handles: ["close"] },
    docs: {
      source: {
        code: `
          <VcAlert closable @close="handleClose">
            Lorem praesentium natus cumque tenetur iusto sequi sit repellat! Temporibus tempora fugit vel amet voluptates ipsam Quidem quos repellat at ut earum velit Vero totam voluptates nesciunt eveniet delectus. Quas.
          </VcAlert>
        `,
      },
    },
  },
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

const DEPRECATED_VARIANTS = [
  { legacy: "solid-light", canonical: "soft" },
  { legacy: "outline-dark", canonical: "tonal" },
] as const;

const DEPRECATED_VARIANTS_MESSAGE =
  "Deprecated `variant` aliases are kept for backward compatibility and resolve to their canonical names at runtime (emitting a one-time dev console warning): `solid-light` → **soft**, `outline-dark` → **tonal**. Each row below shows the deprecated alias next to its canonical replacement — they render identically. Prefer the canonical names in new code.";

export const Deprecations: StoryType = {
  tags: ["deprecated"],
  parameters: {
    docs: {
      description: {
        story: DEPRECATED_VARIANTS_MESSAGE,
      },
    },
  },
  render: () => ({
    components: { VcAlert, VcMarkdownRender },
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
          <VcAlert :variant="pair.legacy">Alert text</VcAlert>
        </div>
        <div class="text-neutral-400">→</div>
        <div class="space-y-1">
          <div class="text-xs text-neutral-500">canonical: <code>{{ pair.canonical }}</code></div>
          <VcAlert :variant="pair.canonical">Alert text</VcAlert>
        </div>
      </div>
    </div>
    `,
  }),
};
