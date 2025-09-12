import { VcVariantPicker } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["xxs", "xs", "sm", "md", "lg"];

export default {
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
} as Meta<typeof VcVariantPicker>;

const Template: StoryFn = (args) => ({
  components: { VcVariantPicker },
  setup: () => ({ args }),
  template: '<VcVariantPicker v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  value: "red",
  isAvailable: true,
};

export const Unavailable = Template.bind({});
Unavailable.args = {
  value: "red",
  isAvailable: false,
};

export const Image = Template.bind({});
Image.args = {
  type: "image",
  value: "product-example-1.webp",
  isAvailable: true,
};

export const UnavailableImage = Template.bind({});
UnavailableImage.args = {
  type: "image",
  value: "product-example-1.webp",
  isAvailable: false,
};

export const Tooltip = Template.bind({});
Tooltip.args = {
  type: "image",
  value: "product-example-1.webp",
  tooltip: "Tooltip",
  isAvailable: true,
};

export const TooltipSlotWithImage: StoryFn = (args) => ({
  components: { VcVariantPicker },
  setup: () => ({ args }),
  template: `
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
  `,
});

TooltipSlotWithImage.args = {
  type: "image",
  value: "product-example-1.webp",
  isAvailable: true,
};

export const Text = Template.bind({});
Text.args = {
  type: "text",
  value: "Size: MD",
  tooltip: "Tooltip",
  isAvailable: true,
};

export const UnavailableText = Template.bind({});
UnavailableText.args = {
  type: "text",
  value: "Size: MD",
  tooltip: "Tooltip",
  isAvailable: false,
};
