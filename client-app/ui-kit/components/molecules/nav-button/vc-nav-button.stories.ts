import { VcNavButton } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"] as const;
const DIRECTIONS = ["right", "left", "up", "down"] as const;

const meta: Meta<typeof VcNavButton> = {
  title: "Components/Molecules/VcNavButton",
  component: VcNavButton,
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
    direction: {
      control: "inline-radio",
      options: DIRECTIONS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: DIRECTIONS.join(" | "),
        },
      },
    },
    disabled: {
      control: "boolean",
      type: { name: "boolean", required: false },
      table: {
        type: {
          summary: "boolean",
        },
        defaultValue: { summary: "false" },
      },
    },
    label: {
      control: "text",
      type: { name: "string", required: false },
      description: "Custom accessible label (overrides default direction-based label)",
      table: {
        type: {
          summary: "string",
        },
      },
    },
    icon: {
      control: "text",
      type: { name: "string", required: false },
      description: "Custom icon name (overrides default chevron icon)",
      table: {
        type: {
          summary: "string",
        },
      },
    },
    onClick: { action: "click" },
  },
  args: {
    size: "md",
    direction: "right",
    disabled: false,
  },
  render: (args) => ({
    components: { VcNavButton },
    setup: () => ({ args }),
    template: '<VcNavButton v-bind="args" @click="args.onClick" />',
  }),
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // Icon-only buttons must have accessible names
            id: "button-name",
            enabled: true,
          },
        ],
      },
    },
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  parameters: {
    docs: {
      source: {
        code: `<VcNavButton />`,
      },
    },
  },
};

export const ExtraSmall: StoryType = {
  args: {
    size: "xs",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcNavButton size="xs" />`,
      },
    },
  },
};

export const Small: StoryType = {
  args: {
    size: "sm",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcNavButton size="sm" />`,
      },
    },
  },
};

export const Medium: StoryType = {
  args: {
    size: "md",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcNavButton size="md" />`,
      },
    },
  },
};

export const Left: StoryType = {
  args: {
    direction: "left",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcNavButton direction="left" />`,
      },
    },
  },
};

export const Right: StoryType = {
  args: {
    direction: "right",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcNavButton direction="right" />`,
      },
    },
  },
};

export const Up: StoryType = {
  args: {
    direction: "up",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcNavButton direction="up" />`,
      },
    },
  },
};

export const Down: StoryType = {
  args: {
    direction: "down",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcNavButton direction="down" />`,
      },
    },
  },
};

export const Disabled: StoryType = {
  args: {
    disabled: true,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcNavButton disabled />`,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: "button-name",
            enabled: true,
          },
          {
            id: "aria-valid-attr-value",
            enabled: true,
          },
        ],
      },
    },
  },
};

export const CustomLabel: StoryType = {
  args: {
    label: "Go to next slide",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcNavButton label="Go to next slide" />`,
      },
    },
  },
};

export const CustomIcon: StoryType = {
  args: {
    icon: "arrow-right",
    label: "Next",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcNavButton icon="arrow-right" label="Next" />`,
      },
    },
  },
};

export const AllSizes: StoryType = {
  render: () => ({
    components: { VcNavButton },
    setup: () => ({ sizes: SIZES }),
    template: `
      <div class="flex items-center gap-4">
        <div v-for="size in sizes" :key="size" class="flex flex-col items-center gap-2">
          <VcNavButton :size="size" direction="right" />
          <span class="text-sm text-neutral-500">{{ size }}</span>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `<VcNavButton size="xs" />
<VcNavButton size="sm" />
<VcNavButton size="md" />`,
      },
    },
  },
};

export const AllDirections: StoryType = {
  render: () => ({
    components: { VcNavButton },
    setup: () => ({ directions: DIRECTIONS }),
    template: `
      <div class="flex items-center gap-4">
        <div v-for="direction in directions" :key="direction" class="flex flex-col items-center gap-2">
          <VcNavButton :direction="direction" />
          <span class="text-sm text-neutral-500">{{ direction }}</span>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `<VcNavButton direction="right" />
<VcNavButton direction="left" />
<VcNavButton direction="up" />
<VcNavButton direction="down" />`,
      },
    },
  },
};

export const AllStates: StoryType = {
  render: () => ({
    components: { VcNavButton },
    setup: () => ({ sizes: SIZES, directions: DIRECTIONS }),
    template: `
      <div class="space-y-8">
        <div v-for="size in sizes" :key="size" class="space-y-2">
          <h3 class="text-lg font-semibold">Size: {{ size }}</h3>
          <div class="flex items-center gap-4">
            <div v-for="direction in directions" :key="direction" class="flex flex-col items-center gap-2">
              <VcNavButton :size="size" :direction="direction" />
              <span class="text-xs text-neutral-500">{{ direction }}</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <VcNavButton :size="size" direction="right" disabled />
              <span class="text-xs text-neutral-500">disabled</span>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `<!-- Size: xs -->
<VcNavButton size="xs" direction="right" />
<VcNavButton size="xs" direction="left" />
<VcNavButton size="xs" direction="up" />
<VcNavButton size="xs" direction="down" />
<VcNavButton size="xs" direction="right" disabled />

<!-- Size: sm -->
<VcNavButton size="sm" direction="right" />
<VcNavButton size="sm" direction="left" />
<VcNavButton size="sm" direction="up" />
<VcNavButton size="sm" direction="down" />
<VcNavButton size="sm" direction="right" disabled />

<!-- Size: md -->
<VcNavButton size="md" direction="right" />
<VcNavButton size="md" direction="left" />
<VcNavButton size="md" direction="up" />
<VcNavButton size="md" direction="down" />
<VcNavButton size="md" direction="right" disabled />`,
      },
    },
  },
};
