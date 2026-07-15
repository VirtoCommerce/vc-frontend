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
