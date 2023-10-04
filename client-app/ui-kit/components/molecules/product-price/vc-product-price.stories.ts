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

const Template: StoryFn<typeof VcProductPrice> = (args) => ({
  components: { VcProductPrice },
  setup: () => ({ args }),
  template: '<VcProductPrice v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  actualPrice: {
    amount: 1599999999,
    formattedAmount: "$1,599,999,999.00",
  },
  listPrice: {
    amount: 1799999999,
    formattedAmount: "$1,799,999,999.00",
  },
};

export const AlignEnd = Template.bind({});
AlignEnd.args = {
  actualPrice: {
    amount: 1599999999,
    formattedAmount: "$1,599,999,999.00",
  },
  listPrice: {
    amount: 1799999999,
    formattedAmount: "$1,799,999,999.00",
  },
  align: "end",
};

export const SingleLine = Template.bind({});
SingleLine.args = {
  actualPrice: {
    amount: 1599999999,
    formattedAmount: "$1,599,999,999.00",
  },
  listPrice: {
    amount: 1799999999,
    formattedAmount: "$1,799,999,999.00",
  },
  singleLine: true,
};

export const Truncate: StoryFn<typeof VcProductPrice> = (args) => ({
  components: { VcProductPrice },
  setup: () => ({ args }),
  template: '<VcProductPrice class="text-lg w-20" v-bind="args" />',
});
Truncate.args = {
  actualPrice: {
    amount: 1599999999,
    formattedAmount: "$1,599,999,999.00",
  },
  listPrice: {
    amount: 1799999999,
    formattedAmount: "$1,799,999,999.00",
  },
  truncate: true,
};

export const UsageExamples: StoryFn<typeof VcProductPrice> = (args) => ({
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
  actualPrice: {
    amount: 1599999999,
    formattedAmount: "$1,599,999,999.00",
  },
  listPrice: {
    amount: 1799999999,
    formattedAmount: "$1,799,999,999.00",
  },
};
