import { getMoney } from "@/ui-kit/mocks";
import { VcProductPrice } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const ALIGNS = ["start", "end"];

export default {
  title: "Components/Molecules/VcProductPrice",
  component: VcProductPrice,
  argTypes: {
    align: {
      control: "inline-radio",
      options: ALIGNS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: ALIGNS.join(" | "),
        },
      },
    },
  },
} as Meta<typeof VcProductPrice>;

const Template: StoryFn = (args) => ({
  components: { VcProductPrice },
  setup: () => ({ args }),
  template: '<VcProductPrice v-bind="args" />',
});

const sharedArgs = {
  actualPrice: getMoney(1599999999),
  listPrice: getMoney(1799999999),
};

export const Basic = Template.bind({});
Basic.args = {
  ...sharedArgs,
};

export const AlignEnd = Template.bind({});
AlignEnd.args = {
  ...sharedArgs,
  align: "end",
};

export const SingleLine = Template.bind({});
SingleLine.args = {
  ...sharedArgs,
  singleLine: true,
};

export const Truncate: StoryFn = (args) => ({
  components: { VcProductPrice },
  setup: () => ({ args }),
  template: '<VcProductPrice class="text-lg w-20" v-bind="args" />',
});
Truncate.args = {
  ...sharedArgs,
  truncate: true,
};

export const VariationsPrice = Template.bind({});
VariationsPrice.args = {
  listPrice: {
    ...sharedArgs.listPrice,
  },
  withFromLabel: true,
};

export const UsageExamples: StoryFn = (args) => ({
  components: { VcProductPrice },
  setup: () => ({ args }),
  template: `<div class="space-y-2">
    <div>
      <span class="text-xs italic">class="text-sm"</span>
      <VcProductPrice
        class="text-sm"
        v-bind="args"
      />
    </div>

    <div>
      <span class="text-xs italic">class="text-sm md:text-lg"</span>
      <VcProductPrice
        class="text-sm md:text-lg"
        v-bind="args"
      />
    </div>

    <div>
      <span class="text-xs italic">class="text-lg md:text-2xl"</span>
      <VcProductPrice
        class="text-lg md:text-2xl"
        v-bind="args"
      />
    </div>
  </div>`,
});
UsageExamples.args = {
  ...sharedArgs,
};
