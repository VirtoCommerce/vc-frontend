import { VcAlert } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const COLORS = ["info", "success", "warning", "danger"];
const VARIANTS = ["solid", "solid-light", "outline", "outline-dark"];
const SIZES = ["sm", "md"];

export default {
  title: "Components/Molecules/VcAlert",
  component: VcAlert,
  argTypes: {
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
    variant: {
      control: "select",
      options: VARIANTS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: VARIANTS.join(" | "),
        },
      },
    },
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
} as Meta<typeof VcAlert>;

const Template: StoryFn = (args) => ({
  components: { VcAlert },
  setup: () => ({ args }),
  template: `<VcAlert v-bind="args">
    Lorem praesentium natus cumque tenetur iusto sequi sit repellat! Temporibus tempora fugit vel amet voluptates ipsam Quidem quos repellat at ut earum velit Vero totam voluptates nesciunt eveniet delectus. Quas.
  </VcAlert>`,
});

export const Basic = Template.bind({});

export const Title = Template.bind({});
Title.args = {
  title: "Alert",
};

export const Outline = Template.bind({});
Outline.args = {
  variant: "outline",
};

export const Icon = Template.bind({});
Icon.args = {
  icon: true,
};

export const Shadow = Template.bind({});
Shadow.args = {
  shadow: true,
};

export const Closable = Template.bind({});
Closable.args = {
  closable: true,
};

export const AllStates: StoryFn = () => ({
  components: { VcAlert },
  setup: () => ({ colors: COLORS, variants: VARIANTS, sizes: SIZES }),
  template: `<div class="space-y-6">
    <div v-for="size in sizes" class="space-y-6">
      <div class="text-sm font-bold border-b">Size: {{ size }}</div>

      <div class="flex flex-wrap gap-1 items-center" v-for="variant in variants">
        <div class="w-32 text-xs">Variant: <b>{{ variant }}</b></div>

        <div class="grow space-y-1">
          <VcAlert v-for="color in colors" :color="color" :variant="variant" :size="size" icon closable>
            Color: {{ color }}
          </VcAlert>
        </div>
      </div>
    </div>
  </div>`,
});
