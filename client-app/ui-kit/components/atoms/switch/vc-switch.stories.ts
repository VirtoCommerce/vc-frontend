import { VcSwitch } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

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

const Template: StoryFn = (args) => ({
  components: { VcSwitch },
  setup: () => ({ args }),
  template: '<VcSwitch v-bind="args" v-model="modelValue" />',
});

const Label: StoryFn = (args) => ({
  components: { VcSwitch },
  setup: () => ({ args }),
  template: '<VcSwitch v-bind="args">Label</VcSwitch>',
});

export const Basic = Template.bind({});

export const WithLabel = Label.bind({});

export const LabelPositionRight = Label.bind({});

LabelPositionRight.args = {
  labelPosition: "right",
};

export const On = Template.bind({});
On.args = {
  modelValue: true,
};

export const DisabledOff = Template.bind({});
DisabledOff.args = {
  disabled: true,
};

export const DisabledOn = Template.bind({});
DisabledOn.args = {
  disabled: true,
  modelValue: true,
};

export const AllStates: StoryFn = () => ({
  components: { VcSwitch },
  setup: () => ({ colors: COLORS, sizes: SIZES }),
  template: `<div class="space-y-6">
    <div v-for="size in sizes" class="space-y-6">
      <h2 class="text-lg font-bold">Size: {{ size }}</h2>

      <div class="space-y-2">
        <div class="flex flex-wrap gap-3">
          <VcSwitch v-for="color in colors" :size="size" :color="color" :modelValue="true">
            Color: {{ color }}
          </VcSwitch>
        </div>

        <h3 class="text-sm font-bold">Disabled</h3>
        <div class="flex flex-wrap gap-3">
          <VcSwitch v-for="color in colors" :size="size" :color="color" :modelValue="true" :disabled="true">
            Color: {{ color }}
          </VcSwitch>
        </div>
      </div>
    </div>
  </div>
  `,
});
