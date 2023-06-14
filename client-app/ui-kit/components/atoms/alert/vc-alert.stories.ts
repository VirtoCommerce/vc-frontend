import { VcAlert } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const COLORS = ["info", "success", "warning", "danger"];
const VARIANTS = ["solid", "outline"];

export default {
  title: "Components/Atoms/VcAlert",
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
  },
} as Meta<typeof VcAlert>;

const Template: StoryFn<typeof VcAlert> = (args) => ({
  components: { VcAlert },
  setup: () => ({ args }),
  template: `<VcAlert v-bind="args">
    <b>Alert</b><br />
    Lorem praesentium natus cumque tenetur iusto sequi sit repellat! Temporibus tempora fugit vel amet voluptates ipsam Quidem quos repellat at ut earum velit Vero totam voluptates nesciunt eveniet delectus. Quas.
  </VcAlert>`,
});

export const Basic = Template.bind({});

export const Outline = Template.bind({});
Outline.args = {
  variant: "outline",
};

export const Icon = Template.bind({});
Icon.args = {
  icon: true,
};

export const AllStates: StoryFn<typeof VcAlert> = () => ({
  components: { VcAlert },
  setup: () => ({ colors: COLORS, variants: VARIANTS }),
  template: `<div class="space-y-6">
    <div class="flex flex-wrap gap-1 items-center" v-for="variant in variants">
      <div class="w-32 text-xs">Variant: <b>{{ variant }}</b></div>

      <VcAlert v-for="color in colors" :color="color" :variant="variant">
        Color: {{ color }}
      </VcAlert>
    </div>

    <div class="flex flex-wrap gap-1 items-center" v-for="variant in variants">
      <div class="w-32 text-xs">Variant: <b>{{ variant }}</b></div>

      <VcAlert v-for="color in colors" :color="color" :variant="variant" icon>
        Color: {{ color }}
      </VcAlert>
    </div>
  </div>
  `,
});
