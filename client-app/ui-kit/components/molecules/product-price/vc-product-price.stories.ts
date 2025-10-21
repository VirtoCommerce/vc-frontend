import { getMoney } from "@/ui-kit/mocks";
import { VcProductPrice } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const ALIGNS = ["start", "end"];

const meta: Meta<typeof VcProductPrice> = {
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
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcProductPrice v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const renderProductPrice = (template: string) => (args: Record<string, unknown>) => ({
  components: { VcProductPrice },
  setup: () => ({ args }),
  template,
});

const sharedArgs = {
  actualPrice: getMoney(1599999999),
  listPrice: getMoney(1799999999),
};

export const Basic: StoryType = {
  args: {
    ...sharedArgs,
  },
};

export const AlignEnd: StoryType = {
  args: {
    ...sharedArgs,
    align: "end",
  },
};

export const SingleLine: StoryType = {
  args: {
    ...sharedArgs,
    singleLine: true,
  },
};

export const Truncate: StoryType = {
  args: {
    ...sharedArgs,
    truncate: true,
  },
  render: renderProductPrice('<VcProductPrice class="text-lg w-20" v-bind="args" />'),
};

export const VariationsPrice: StoryType = {
  args: {
    listPrice: {
      ...sharedArgs.listPrice,
    },
    withFromLabel: true,
  },
};

export const UsageExamples: StoryType = {
  args: {
    ...sharedArgs,
  },
  render: renderProductPrice(`<div class="space-y-2">
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
  </div>`),
};
