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
  parameters: {
    docs: {
      source: {
        code: `
          <VcVariantPicker v-bind="args" />
        `,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `
          <VcVariantPicker type="image" :value="product-example-1.webp" is-available>
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
        `,
      },
    },
  },
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

export const MultiColorManyColors: StoryType = {
  args: {
    type: "color",
    value: ["red", "orange", "yellow", "green", "blue", "indigo", "violet", "pink", "cyan", "magenta"],
    isAvailable: true,
    tooltip: "10 colors (shows first 4 only)",
  },
};

export const TooltipSlotWithColor: StoryType = {
  args: {
    type: "color",
    value: "red",
    isAvailable: true,
  },
  render: renderVariantPicker(`
    <div class="p-6">
      <VcVariantPicker v-bind="args">
        <template #tooltip>
          <div class="flex gap-2 max-w-44 font-normal">
            <div class="flex-none size-6 rounded-md bg-[red]"></div>
            <div class="grow">
              <div class="font-bold">Red Color</div>
              <div class="text-xs text-neutral-600">This is a custom tooltip for single color variant.</div>
            </div>
          </div>
        </template>
      </VcVariantPicker>
    </div>
  `),
  parameters: {
    docs: {
      source: {
        code: `
          <VcVariantPicker type="color" :value="['red']" is-available>
            <template #tooltip>
              <div class="flex gap-2 max-w-44 font-normal">
                <div class="flex-none size-6 rounded-md bg-[red]"></div>
                <div class="grow">
                  <div class="font-bold">Red Color</div>
                  <div class="text-xs text-neutral-600">This is a custom tooltip for single color variant.</div>
                </div>
              </div>
            </template>
          </VcVariantPicker>
        `,
      },
    },
  },
};

export const TooltipSlotWithVariantPickerTeleportEnabled: StoryType = {
  args: {
    type: "color",
    value: ["red", "blue", "green", "yellow"],
    isAvailable: true,
    tooltipEnableTeleport: true,
    tooltipTeleportSelector: "body",
  },
  render: renderVariantPicker(`
    <div class="p-6">
      <VcVariantPicker v-bind="args">
        <template #tooltip>
          <div class="flex gap-2 max-w-44 font-normal">
            <div>
            <VcVariantPicker type="color" size="xs" :value="['red', 'blue', 'green', 'yellow']" isAvailable="false">
</div>

            <div class="grow">
              <div class="font-bold">Variant Picker</div>
              <div class="text-xs text-neutral-600">This variant includes 4 colors: Red, Blue, Green, and Yellow.</div>
            </div>
          </div>
        </template>
      </VcVariantPicker>
    </div>
  `),
  parameters: {
    docs: {
      source: {
        code: `
          <VcVariantPicker type="color" size="xs" :value="['red', 'blue', 'green', 'yellow']" is-available tooltip-enable-teleport tooltip-teleport-selector="body">
            <template #tooltip>
              <div class="flex gap-2 max-w-44 font-normal">
                <div>
                <VcVariantPicker type="color" size="xs" :value="['red', 'blue', 'green', 'yellow']" isAvailable="false">
    </div>

                <div class="grow">
                  <div class="font-bold">Variant Picker</div>
                  <div class="text-xs text-neutral-600">This variant includes 4 colors: Red, Blue, Green, and Yellow.</div>
                </div>
              </div>
            </template>
          </VcVariantPicker>
        `,
      },
    },
  },
};

export const TooltipSlotWithText: StoryType = {
  args: {
    type: "text",
    value: "Size: MD",
    isAvailable: true,
  },
  render: renderVariantPicker(`
    <div class="p-6">
      <VcVariantPicker v-bind="args">
        <template #tooltip>
          <div class="flex gap-2 max-w-64 font-normal">
            <div class="flex-none flex size-12 items-center justify-center rounded-md bg-neutral-100 font-bold">
              MD
            </div>
            <div>
              <div class="font-bold">Medium Size</div>
              <div class="text-xs text-neutral-600">This size fits most people. Check size guide for measurements.</div>
            </div>
          </div>
        </template>
      </VcVariantPicker>
    </div>
  `),
  parameters: {
    docs: {
      source: {
        code: `
          <VcVariantPicker type="text" size="xs" :value="['Size: MD']" is-available>
            <template #tooltip>
              <div class="flex gap-2 max-w-64 font-normal">
                <div class="flex-none flex size-12 items-center justify-center rounded-md bg-neutral-100 font-bold">
                  MD
                </div>
                <div>
                  <div class="font-bold">Medium Size</div>
                  <div class="text-xs text-neutral-600">This size fits most people. Check size guide for measurements.</div>
                </div>
              </div>
            </template>
          </VcVariantPicker>
        `,
      },
    },
  },
};
