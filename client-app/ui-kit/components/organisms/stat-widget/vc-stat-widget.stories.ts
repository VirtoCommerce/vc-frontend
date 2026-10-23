import { MAIN_COLORS } from "@/ui-kit/constants";
import { VcStatWidget } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const COLOR_OPTIONS = [...MAIN_COLORS];

const meta: Meta<typeof VcStatWidget> = {
  title: "Components/Organisms/VcStatWidget",
  component: VcStatWidget,
  argTypes: {
    color: {
      control: "select",
      options: COLOR_OPTIONS,
      type: { name: "string", required: false },
      table: { type: { summary: COLOR_OPTIONS.join(" | ") } },
    },
    deltaColor: {
      control: "select",
      options: COLOR_OPTIONS,
      type: { name: "string", required: false },
      table: { type: { summary: COLOR_OPTIONS.join(" | ") } },
    },
    loading: { control: "boolean" },
    errorText: { control: "text" },
  },
  args: {
    label: "Revenue this week",
    value: "$12,480.00",
    icon: "cash",
    color: "info",
    description: "48 orders",
    delta: "+12% vs last week",
    deltaColor: "success",
    deltaIcon: "chevron-up",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<div class="max-w-64"><VcStatWidget v-bind="args" /></div>',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const renderStats = (template: string) => (args: Record<string, unknown>) => ({
  setup: () => ({ args, colors: COLOR_OPTIONS }),
  template,
});

export const Basic: StoryType = {};

export const Colors: StoryType = {
  render: renderStats(`<div class="grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-4">
    <VcStatWidget v-for="color in colors" :key="color" v-bind="args" :color="color" :label="color" />
  </div>`),
};

export const DeltaColors: StoryType = {
  render: renderStats(`<div class="grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-4">
    <VcStatWidget v-bind="args" label="Higher" delta="+12% vs last week" delta-color="success" delta-icon="chevron-up" />
    <VcStatWidget v-bind="args" label="Watch" delta="3 overdue" delta-color="warning" delta-icon="exclamation-circle" />
    <VcStatWidget v-bind="args" label="Lower" delta="-8% vs last week" delta-color="danger" delta-icon="chevron-down" />
    <VcStatWidget v-bind="args" label="Unchanged" delta="0% vs last week" delta-color="neutral" delta-icon="minus" />
  </div>`),
};

export const WithSuffix: StoryType = {
  args: {
    label: "Active carts",
    value: "34",
    valueSuffix: "items",
    icon: "cart",
    color: "success",
    description: "$2,310.00 in carts",
    delta: "5 abandoned for over 7 days",
    deltaColor: "neutral",
    deltaIcon: undefined,
  },
};

export const Loading: StoryType = {
  args: {
    loading: true,
  },
};

export const ErrorState: StoryType = {
  args: {
    errorText: "Couldn't load",
  },
};

export const PrependSlot: StoryType = {
  render: renderStats(`<div class="max-w-64">
    <VcStatWidget v-bind="args">
      <template #prepend>
        <VcIcon name="switch-vertical" :size="16" />
      </template>
    </VcStatWidget>
  </div>`),
};

const ROW_CARDS = [
  {
    label: "Orders in “New” status",
    value: "7",
    icon: "exclamation-circle",
    color: "warning",
    description: "$3,150.00 total",
    delta: "of 21 created in the last 7 days",
    deltaColor: "neutral",
  },
  {
    label: "Orders this week",
    value: "21",
    icon: "cart",
    color: "success",
    description: "$9,870.00 total",
    delta: "+12%",
    deltaColor: "success",
    deltaIcon: "chevron-up",
  },
  {
    label: "Revenue MTD",
    value: "$41,200.00",
    icon: "cash",
    color: "info",
    delta: "-4%",
    deltaColor: "danger",
    deltaIcon: "chevron-down",
  },
  {
    label: "Revenue YTD",
    value: "$402,900.00",
    icon: "cash",
    color: "info",
    delta: "0%",
    deltaColor: "neutral",
    deltaIcon: "minus",
  },
  { label: "Average order value", value: "$470.00", icon: "cash", color: "info", loading: true },
  { label: "Customers", value: "128", icon: "users", errorText: "Couldn't load" },
];

export const Row: StoryType = {
  render: () => ({
    setup: () => ({ cards: ROW_CARDS }),
    template: `<div class="flex flex-wrap gap-4">
      <VcStatWidget v-for="card in cards" :key="card.label" v-bind="card" class="grow basis-44" />
    </div>`,
  }),
};
