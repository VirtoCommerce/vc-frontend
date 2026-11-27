import { ref } from "vue";
import { productImageMocks } from "@/ui-kit/mocks";
import { VcVariantPicker, VcVariantPickerGroup } from "..";
import type { Meta, StoryObj, StoryFn } from "@storybook/vue3-vite";

const SIZES = ["xxs", "xs", "sm", "md", "lg"];

const [image1] = productImageMocks;

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
      description: {
        component:
          "One option of a choice: a colour, an image, a text tile or a card (`type`). The options of one choice " +
          "go in `VcVariantPickerGroup`, which holds the selection and the keyboard: in a single-choice group the " +
          "pickers are one Tab stop and the arrow keys move the focus between them, in a `multiple` group every " +
          "picker is a Tab stop (see VcVariantPickerGroup). A picker on its own is a Tab stop; Space or Enter " +
          "selects it.",
      },
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

export const WithGroup: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref<string | string[]>("red");
    const items = [
      { value: "red", isAvailable: true },
      { value: "blue", isAvailable: true },
      { value: "green", isAvailable: false },
      { value: "yellow", isAvailable: true },
    ];
    return { args, model, items };
  },
  template: `
    <div class="p-6">
      <div class="mb-3">Selected: {{ model }}</div>
      <VcVariantPickerGroup v-model="model" v-bind="args">
        <VcVariantPicker v-for="item in items" :key="item.value" :value="item.value" :is-available="item.isAvailable" />
      </VcVariantPickerGroup>
    </div>
  `,
});
WithGroup.args = {
  type: "color",
  multiple: false,
};

export const WithGroupMultiple: StoryFn = (args) => ({
  components: { VcVariantPickerGroup, VcVariantPicker },
  setup: () => {
    const model = ref<string[]>([]);
    const items = [
      { value: "red", isAvailable: true },
      { value: "blue", isAvailable: true },
      { value: "green", isAvailable: false },
      { value: "yellow", isAvailable: true },
    ];
    return { args, model, items };
  },
  template: `
    <div class="p-6">
      <div class="mb-3">Selected: {{ model }}</div>
      <VcVariantPickerGroup v-model="model" v-bind="args">
        <VcVariantPicker v-for="item in items" :key="item.value" :value="item.value" :is-available="item.isAvailable" />
      </VcVariantPickerGroup>
    </div>
  `,
});
WithGroupMultiple.args = {
  type: "color",
  multiple: true,
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
    value: image1,
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
    value: image1,
    tooltip: "Tooltip",
    isAvailable: true,
  },
};

export const TooltipSlotWithImage: StoryType = {
  args: {
    type: "image",
    value: image1,
    isAvailable: true,
  },
  render: renderVariantPicker(`
    <div class="p-6">
      <VcVariantPicker v-bind="args">
        <template #tooltip>
          <div class="flex items-center gap-2 max-w-64 font-normal">
            <VcImage :src="args.value" alt="Variant preview" class="size-12 rounded-md [--vc-image-object-fit:cover]" />
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
          <VcVariantPicker type="image" value="https://example.com/product-1.webp" is-available>
            <template #tooltip>
              <div class="flex items-center gap-2 max-w-64 font-normal">
                <VcImage :src="args.value" alt="Variant preview" class="size-12 rounded-md [--vc-image-object-fit:cover]" />
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
            <VcVariantPicker type="color" size="xs" :value="['red', 'blue', 'green', 'yellow']" :isAvailable="false" />
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
                <VcVariantPicker type="color" size="xs" :value="['red', 'blue', 'green', 'yellow']" :isAvailable="false" />
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

const CARD_TEMPLATE = `<VcVariantPicker v-model="model" type="card" value="1m" is-available>
  <template #prepend>
    <span class="flex size-8 items-center justify-center rounded-full bg-accent-50">
      <VcIcon name="calendar" />
    </span>
  </template>

  <template #default>1 month</template>

  <template #description>
    <VcProductPrice :actual-price="{ amount: 58.08, formattedAmount: '$58.08' }" single-line />
  </template>

  <template #corner>
    <VcBadge color="success" size="xs" rounded nowrap>−12%</VcBadge>
  </template>
</VcVariantPicker>`;

export const Card: StoryType = {
  render: () => ({
    setup: () => ({ model: ref("1m") }),
    template: `<div class="p-6">${CARD_TEMPLATE}</div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "No interactive content (buttons, links, inputs) inside a card: the whole card is one focusable radio.\n\n" +
          '`type="card"` is a selectable frame; its slots hold any non-interactive content. The default slot names ' +
          "the card, `description` and `corner` describe it. A picker on its own keeps room for its corner content.",
      },
      source: {
        code: CARD_TEMPLATE,
      },
    },
  },
};

// The badge size whose font is the closest to the picker's description font without exceeding it.
const BADGE_SIZES = { xxs: "sm", xs: "sm", sm: "sm", md: "md", lg: "md" } as const;

const CARD_SIZES_TEMPLATE = `<VcVariantPickerGroup v-model="model" type="card" name="size" aria-label="Sizes">
  <VcVariantPicker v-for="size in sizes" :key="size" :size="size" :value="size" is-available>
    <template #prepend>
      <VcIcon name="calendar" />
    </template>

    <template #default>Size {{ size }}</template>

    <template #description>
      <VcProductPrice :actual-price="{ amount: 58.08, formattedAmount: '$58.08' }" single-line />
    </template>

    <template #append>
      <VcBadge color="success" :size="badgeSizes[size]" rounded nowrap>−12%</VcBadge>
    </template>
  </VcVariantPicker>
</VcVariantPickerGroup>`;

export const CardSizes: StoryType = {
  render: () => ({
    setup: () => ({ model: ref("md"), sizes: SIZES, badgeSizes: BADGE_SIZES }),
    template: `<div class="p-6">${CARD_SIZES_TEMPLATE}</div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Every size sets the card's minimum height, the text size of the default and `description` slots " +
          "(a `VcProductPrice` follows) and the size of a `VcIcon` without `size` in `prepend`. The group has no " +
          "`size`, so each picker keeps its own. `size` sets nothing on the `append` slot: its content keeps its own " +
          "size, so the `VcBadge` here takes the `size` whose font is the closest to the `description` font without " +
          "exceeding it. The slot sits at the card's end and is never covered, because the text beside it wraps in the " +
          "room it leaves.",
      },
      source: {
        code: CARD_SIZES_TEMPLATE,
      },
    },
  },
};

const CARD_SIZES_CORNER_TEMPLATE = `<VcVariantPickerGroup v-model="model" type="card" name="size" aria-label="Sizes">
  <VcVariantPicker v-for="size in sizes" :key="size" :size="size" :value="size" is-available>
    <template #prepend>
      <VcIcon name="calendar" />
    </template>

    <template #default>Size {{ size }}</template>

    <template #description>
      <VcProductPrice :actual-price="{ amount: 58.08, formattedAmount: '$58.08' }" single-line />
    </template>

    <template #corner>
      <VcBadge color="success" size="xs" rounded nowrap>−12%</VcBadge>
    </template>
  </VcVariantPicker>
</VcVariantPickerGroup>`;

export const CardSizesCorner: StoryType = {
  render: () => ({
    setup: () => ({ model: ref("md"), sizes: SIZES }),
    template: `<div class="p-6">${CARD_SIZES_CORNER_TEMPLATE}</div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "The `corner` slot over the top-end corner of every size. `size` sets nothing on it: the `VcBadge` keeps " +
          '`size="xs"` at every picker size, since a corner tag stays small. The group keeps room ' +
          "above and beside its direct-child pickers for the corner content, so it is never cut.",
      },
      source: {
        code: CARD_SIZES_CORNER_TEMPLATE,
      },
    },
  },
};

const CARD_FREE_LAYOUT_TEMPLATE = `<VcVariantPickerGroup
  v-model="model"
  type="card"
  name="finish"
  aria-label="Finish"
  :columns="3"
  class="w-96 [--vc-variant-picker-card-padding:0]"
>
  <VcVariantPicker v-for="finish in finishes" :key="finish.value" :value="finish.value" is-available>
    <VcImage :src="finish.image" alt="" class="aspect-square w-full [--vc-image-object-fit:cover]" />
    <span class="block px-2 py-1.5">{{ finish.name }}</span>
  </VcVariantPicker>
</VcVariantPickerGroup>`;

export const CardFreeLayout: StoryType = {
  render: () => ({
    setup: () => ({
      model: ref("oak"),
      finishes: [
        { value: "oak", name: "Oak", image: "product-example-1.webp" },
        { value: "walnut", name: "Walnut", image: "product-example-2.webp" },
        { value: "ash", name: "Ash", image: "product-example-3.webp" },
      ],
    }),
    template: `<div class="p-6">${CARD_FREE_LAYOUT_TEMPLATE}</div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Only the default slot: it fills the card, and the card imposes no layout on it; the content inherits the " +
          "font size and weight `size` sets and the accent colour. " +
          "`--vc-variant-picker-card-padding: 0` lets the image run to the card's edge.",
      },
      source: {
        code: CARD_FREE_LAYOUT_TEMPLATE,
      },
    },
  },
};

const CORNER_ON_SWATCH_TEMPLATE = `<VcVariantPickerGroup v-model="model" type="color" name="color" aria-label="Color">
  <VcVariantPicker value="red" tooltip="Red" is-available />

  <VcVariantPicker value="blue" tooltip="Blue" is-available>
    <template #corner>
      <VcBadge color="info" size="xs" rounded nowrap>New</VcBadge>
    </template>
  </VcVariantPicker>

  <VcVariantPicker value="green" tooltip="Green" is-available />
  <VcVariantPicker value="yellow" tooltip="Yellow" :is-available="false" />
</VcVariantPickerGroup>`;

export const CornerOnSwatch: StoryType = {
  render: () => ({
    setup: () => ({ model: ref("red") }),
    template: `<div class="p-6">${CORNER_ON_SWATCH_TEMPLATE}</div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "The `corner` slot works on every type. While a picker has corner content, the group keeps room for it, " +
          "so it never covers the row above.",
      },
      source: {
        code: CORNER_ON_SWATCH_TEMPLATE,
      },
    },
  },
};

const CARD_UNAVAILABLE_TEMPLATE = `<VcVariantPicker
  v-model="model"
  type="card"
  value="3m"
  :is-available="false"
  tooltip="Back in stock in 2 weeks"
>
  <template #prepend>
    <span class="flex size-8 items-center justify-center rounded-full bg-accent-50">
      <VcIcon name="calendar" />
    </span>
  </template>

  <template #default>3 months</template>

  <template #description>
    <VcProductPrice :actual-price="{ amount: 62.7, formattedAmount: '$62.70' }" single-line />
  </template>

  <template #corner>
    <VcBadge color="success" size="xs" rounded nowrap>−5%</VcBadge>
  </template>
</VcVariantPicker>`;

export const CardUnavailable: StoryType = {
  render: () => ({
    setup: () => ({ model: ref("") }),
    template: `<div class="p-6">${CARD_UNAVAILABLE_TEMPLATE}</div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "An unavailable card draws its frame dashed (a checked one never does); its content keeps its colours, and " +
          "there is no diagonal strike-through. " +
          "It stays selectable (the picker has no disabled state): click it to see the checked frame. Its tooltip " +
          "describes it.",
      },
      source: {
        code: CARD_UNAVAILABLE_TEMPLATE,
      },
    },
  },
};
