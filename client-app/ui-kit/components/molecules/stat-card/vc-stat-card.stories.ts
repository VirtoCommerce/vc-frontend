import { VcStatCard } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const COLORS = ["primary", "secondary", "neutral", "accent", "info", "success", "warning", "danger"];
const TONES = ["positive", "negative", "neutral"];

const meta: Meta<typeof VcStatCard> = {
  title: "Components/Molecules/VcStatCard",
  component: VcStatCard,
  argTypes: {
    color: {
      control: "select",
      options: COLORS,
      type: { name: "string", required: false },
      table: { type: { summary: COLORS.join(" | ") } },
    },
    deltaTone: {
      control: "inline-radio",
      options: TONES,
      type: { name: "string", required: false },
      table: { type: { summary: TONES.join(" | ") } },
    },
  },
  args: {
    label: "Orders placed · MTD",
    value: "128",
    icon: "cash",
    color: "info",
    sub: "$24,310.00",
    delta: "+12% vs last month",
    deltaTone: "positive",
    deltaIcon: "chevron-up",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<div class="max-w-72"><VcStatCard v-bind="args" /></div>',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {};

export const ValueSuffix: StoryType = {
  args: {
    label: "Active carts",
    value: "34",
    valueSuffix: "items",
    icon: "cart",
    color: "success",
    sub: "6 not for checkout",
    delta: "12 items this week",
    deltaIcon: undefined,
  },
};

export const NegativeDelta: StoryType = {
  args: { delta: "-8% vs last month", deltaTone: "negative", deltaIcon: "chevron-down" },
};

export const Loading: StoryType = {
  args: { loading: true },
};

export const Failed: StoryType = {
  args: { errorText: "Couldn't load" },
};

/** Stands in for a card whose figure is not known yet: the same box, a pulsing bar per line. */
export const Placeholder: StoryType = {
  args: { placeholder: true },
};

/** Content in the `leading` slot sits ahead of the icon and can take the accent from `--vc-stat-card-accent`. */
export const LeadingSlot: StoryType = {
  render: (args) => ({
    setup: () => ({ args }),
    template: `<div class="max-w-72">
      <VcStatCard v-bind="args">
        <template #leading>
          <span class="inline-flex" style="color: var(--vc-stat-card-accent)"><VcIcon name="switch-vertical" :size="16" /></span>
        </template>
      </VcStatCard>
    </div>`,
  }),
};

/** A color outside the palette: set the variable on the card itself. */
export const CustomAccent: StoryType = {
  render: (args) => ({
    setup: () => ({ args }),
    template: '<div class="max-w-72"><VcStatCard v-bind="args" style="--vc-stat-card-accent: #8b5cf6" /></div>',
  }),
};

export const Row: StoryType = {
  render: () => ({
    components: { VcStatCard },
    template: `<div class="flex flex-wrap gap-4">
      <VcStatCard class="grow basis-44" label="New orders" value="5" icon="exclamation-circle" color="warning" sub="$1,200.00 total" delta="of 18 created in the last 7 days" delta-tone="neutral" />
      <VcStatCard class="grow basis-44" label="Orders placed · YTD" value="1,284" icon="cash" color="info" sub="$310,422.00" delta="+4% vs last year" delta-icon="chevron-up" />
      <VcStatCard class="grow basis-44" label="My customers" value="42" icon="users" sub="17 ordered this month" delta="3 new customers" />
      <VcStatCard class="grow basis-44" placeholder />
    </div>`,
  }),
};
