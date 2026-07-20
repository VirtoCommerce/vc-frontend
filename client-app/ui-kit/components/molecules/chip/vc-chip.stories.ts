import { VcChip, VcAlert } from "..";
import { VcMarkdownRender } from "../../atoms";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["sm", "md", "lg"];
const COLORS = ["primary", "secondary", "success", "info", "neutral", "warning", "danger", "accent"];
const VARIANTS = ["solid", "soft", "outline", "surface", "ghost", "tonal"];

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
      description:
        "Visual style. Deprecated aliases (still supported, emit a one-time dev warning): `solid-light` → `soft`, `outline-dark` → `tonal`.",
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

export const Basic: StoryType = {
  args: {},
  parameters: {
    docs: {
      source: {
        code: `
          <VcChip>Chip text</VcChip>
        `,
      },
    },
  },
};

export const Soft: StoryType = {
  args: { variant: "soft" },
};

export const Outline: StoryType = {
  args: { variant: "outline" },
};

export const Surface: StoryType = {
  args: { variant: "surface" },
};

export const Ghost: StoryType = {
  args: { variant: "ghost" },
};

export const Tonal: StoryType = {
  args: { variant: "tonal" },
};

export const Rounded: StoryType = {
  args: { rounded: true },
  parameters: {
    docs: {
      source: {
        code: `
          <VcChip rounded>Chip text</VcChip>
        `,
      },
    },
  },
};

export const Closable: StoryType = {
  args: { closable: true },
  parameters: {
    docs: {
      source: {
        code: `
          <VcChip closable>Chip text</VcChip>
        `,
      },
    },
  },
};

export const Clickable: StoryType = {
  args: { clickable: true },
  parameters: {
    docs: {
      source: {
        code: `
          <VcChip clickable>Chip text</VcChip>
        `,
      },
    },
  },
};

export const Disabled: StoryType = {
  args: { disabled: true },
  parameters: {
    docs: {
      source: {
        code: `
          <VcChip disabled>Chip text</VcChip>
        `,
      },
    },
  },
};

export const Icon: StoryType = {
  args: { icon: "circle-solid" },
  parameters: {
    docs: {
      source: {
        code: `
          <VcChip icon="circle-solid">Chip text</VcChip>
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
          <VcChip>
            <VcIcon name="circle-solid" />
            <span>Chip text</span>
          </VcChip>
        `,
      },
    },
  },
};

export const IconColorPallette: StoryType = {
  args: {
    variant: "outline",
    icon: "circle-solid",
    iconColor: "secondary",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcChip variant="outline" icon="circle-solid" icon-color="secondary">Chip text</VcChip>
        `,
      },
    },
  },
};

export const IconColorHEX: StoryType = {
  args: {
    variant: "outline",
    icon: "circle-solid",
    iconColor: "#ff0000",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcChip variant="outline" icon="circle-solid" icon-color="#ff0000">Chip text</VcChip>
        `,
      },
    },
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
  parameters: {
    docs: {
      source: {
        code: `
          <VcChip truncate class="w-36">
            <span>Long long long Chip text</span>
          </VcChip>
        `,
      },
    },
  },
};

export const RouterLink: StoryType = {
  args: {
    clickable: true,
    to: "/",
    icon: "link",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcChip clickable to="/" icon="link">Chip text</VcChip>
        `,
      },
    },
  },
};

export const ExternalLink: StoryType = {
  args: {
    clickable: true,
    externalLink: "https://example.com",
    target: "_blank",
    icon: "external-link",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcChip clickable external-link="https://example.com" target="_blank" icon="external-link">Chip text</VcChip>
        `,
      },
    },
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
  parameters: {
    docs: {
      source: {
        code: `
          <VcChip closable clickable @click="handleClick" @close="handleClose">
            Chip with actions
          </VcChip>
        `,
      },
    },
  },
};

export const Draggable: StoryType = {
  args: {
    draggable: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcChip draggable>Chip text</VcChip>
        `,
      },
    },
  },
};

export const ClosableClickable: StoryType = {
  args: {
    closable: true,
    clickable: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcChip closable clickable>Chip text</VcChip>
        `,
      },
    },
  },
};

export const DisabledClosable: StoryType = {
  args: {
    disabled: true,
    closable: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcChip disabled closable>Chip text</VcChip>
        `,
      },
    },
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
  parameters: {
    docs: {
      source: {
        code: `
          <VcChip closable @close="handleClose">
            Custom close
            <template #close-icon>
              <VcIcon name="delete" />
            </template>
          </VcChip>
        `,
      },
    },
  },
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

export const AllVariantsClickable: StoryType = {
  render: () => ({
    setup: () => ({ colors: COLORS, variants: VARIANTS }),
    template: `<div class="space-y-3">
      <div class="space-y-1" v-for="variant in variants">
        <div class="text-base">Variant: <b>{{ variant }}</b></div>

        <div class="flex flex-wrap gap-2 items-center">
          <VcChip v-for="color in colors" size="md" :color="color" :variant="variant" icon="circle-solid" clickable>
            Color: {{ color }}
          </VcChip>
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
    components: { VcChip, VcAlert, VcMarkdownRender },
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
          <VcChip :variant="pair.legacy">Chip text</VcChip>
        </div>
        <div class="text-neutral-400">→</div>
        <div class="space-y-1">
          <div class="text-xs text-neutral-500">canonical: <code>{{ pair.canonical }}</code></div>
          <VcChip :variant="pair.canonical">Chip text</VcChip>
        </div>
      </div>
    </div>
    `,
  }),
};
