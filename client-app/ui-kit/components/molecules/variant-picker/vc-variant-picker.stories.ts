import { VcVariantPicker } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xxs", "xs", "sm", "md", "lg"];

const meta: Meta<typeof VcVariantPicker> = {
  title: "Components/Molecules/VcVariantPicker",
  component: VcVariantPicker,
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
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcVariantPicker v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const renderVariantPicker = (template: string) => (args: Record<string, unknown>) => ({
  setup: () => ({ args }),
  template,
});

export const Basic: StoryType = {
  args: {
    value: "red",
    isAvailable: true,
  },
};

export const Unavailable: StoryType = {
  args: {
    value: "red",
    isAvailable: false,
  },
};

export const Image: StoryType = {
  args: {
    type: "image",
    value: "product-example-1.webp",
    isAvailable: true,
  },
};

export const UnavailableImage: StoryType = {
  args: {
    ...Image.args,
    isAvailable: false,
  },
};

export const Tooltip: StoryType = {
  args: {
    type: "image",
    value: "product-example-1.webp",
    tooltip: "Tooltip",
    isAvailable: true,
  },
};

export const TooltipSlotWithImage: StoryType = {
  args: {
    type: "image",
    value: "product-example-1.webp",
    isAvailable: true,
  },
  render: renderVariantPicker(`
    <div class="p-6">
      <VcVariantPicker v-bind="args">
        <template #tooltip>
          <div class="flex items-center gap-2 max-w-64 font-normal">
            <VcImage :src="args.value" alt="Variant preview" class="size-12 rounded-md object-cover" />
            <div>
              <div class="font-bold">Variant preview</div>
              <div class="text-xs text-neutral-600">This tooltip content comes from the slot and can include any markup.</div>
            </div>
          </div>
        </template>
      </VcVariantPicker>
    </div>
  `),
};

export const Text: StoryType = {
  args: {
    type: "text",
    value: "Size: MD",
    tooltip: "Tooltip",
    isAvailable: true,
  },
};

export const UnavailableText: StoryType = {
  args: {
    ...Text.args,
    isAvailable: false,
  },
};

export const MultiColor1Color: StoryType = {
  args: {
    type: "color",
    value: ["red"],
    isAvailable: true,
    tooltip: "Red",
  },
};

export const MultiColor2Colors: StoryType = {
  args: {
    type: "color",
    value: ["red", "blue"],
    isAvailable: true,
    tooltip: "Red & Blue",
  },
};

export const MultiColor3Colors: StoryType = {
  args: {
    type: "color",
    value: ["red", "green", "blue"],
    isAvailable: true,
    tooltip: "Red, Green & Blue",
  },
};

export const MultiColor4Colors: StoryType = {
  args: {
    type: "color",
    value: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"],
    isAvailable: true,
    tooltip: "Custom colors",
  },
};

export const MultiColorUnavailable: StoryType = {
  args: {
    type: "color",
    value: ["red", "blue"],
    isAvailable: false,
    tooltip: "Unavailable multicolor",
  },
};
