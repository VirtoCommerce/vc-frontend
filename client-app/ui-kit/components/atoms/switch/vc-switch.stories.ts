import { VcSwitch } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md", "lg"];
const COLORS = ["primary", "secondary", "success", "info", "neutral", "accent", "warning", "danger"];
const LABEL = ["left", "right"];

export default {
  title: "Components/Atoms/VcSwitch",
  component: VcSwitch,
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
    labelPosition: {
      control: "inline-radio",
      options: LABEL,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: LABEL.join(" | "),
        },
      },
    },
  },
} as Meta<typeof VcSwitch>;

type StoryType = StoryObj<typeof VcSwitch>;

export const Basic: StoryType = {
  args: {
    ariaLabel: "Basic switch",
  },
};

export const WithLabel: StoryType = {
  args: {
    label: "Label",
    ariaLabel: "Label",
  },
};

export const WithSlot: StoryType = {
  render: (args) => ({
    components: { VcSwitch },
    setup: () => ({ args }),
    template: '<VcSwitch v-bind="args">Label from slot</VcSwitch>',
  }),
  args: {
    ariaLabel: "Label from slot",
  },
};

export const LabelPositionRight: StoryType = {
  args: {
    label: "Label",
    labelPosition: "right",
    ariaLabel: "Label",
  },
};

export const On: StoryType = {
  args: {
    modelValue: true,
    ariaLabel: "Switch on",
  },
};

export const DisabledOff: StoryType = {
  args: {
    disabled: true,
    ariaLabel: "Disabled switch",
  },
};

export const DisabledOn: StoryType = {
  args: {
    disabled: true,
    modelValue: true,
    ariaLabel: "Disabled switch on",
  },
};

export const AllStates: StoryType = {
  render: () => ({
    components: { VcSwitch },
    setup: () => ({ colors: COLORS, sizes: SIZES }),
    template: `<div class="space-y-6">
    <div v-for="size in sizes" class="space-y-6">
      <h2 class="text-lg font-bold">Size: {{ size }}</h2>

      <div class="space-y-2">
        <div class="flex flex-wrap gap-3">
          <VcSwitch v-for="color in colors" :key="color" :size="size" :color="color" :modelValue="true" :aria-label="\`\${color} switch\`">
            Color: {{ color }}
          </VcSwitch>
        </div>

        <h3 class="text-sm font-bold">Disabled</h3>
        <div class="flex flex-wrap gap-3">
          <VcSwitch v-for="color in colors" :key="color" :size="size" :color="color" :modelValue="true" :disabled="true" :aria-label="\`\${color} disabled switch\`">
            Color: {{ color }}
          </VcSwitch>
        </div>
      </div>
    </div>
  </div>
  `,
  }),
};
