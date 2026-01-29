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

export const Basic: StoryType = {};

export const Left: StoryType = {
  args: {
    direction: "left",
  },
};

export const Right: StoryType = {
  args: {
    direction: "right",
  },
};

export const Up: StoryType = {
  args: {
    direction: "up",
  },
};

export const Down: StoryType = {
  args: {
    direction: "down",
  },
};

export const Disabled: StoryType = {
  args: {
    disabled: true,
  },
  parameters: {
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
};
