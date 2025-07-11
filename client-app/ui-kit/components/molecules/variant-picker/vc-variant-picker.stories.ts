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
