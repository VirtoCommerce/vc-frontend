import { VcEmptyView } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES: VcEmptyViewSizeType[] = ["auto", "xs", "sm", "md", "lg", "xl"];
const REASONS: VcEmptyViewReasonType[] = [
  "no-data",
  "no-results",
  "cleared",
  "caught-up",
  "error",
  "no-access",
  "not-found",
  "done",
];
const ENTITIES: VcEmptyViewEntityType[] = [
  "activity",
  "addresses",
  "back-in-stock",
  "branches",
  "cart",
  "catalog",
  "compare",
  "coupons",
  "customers",
  "dashboard",
  "documents",
  "lists",
  "members",
  "missions",
  "news",
  "notifications",
  "orders",
  "payment-methods",
  "points",
  "purchase-requests",
  "quotes",
  "records",
  "returns",
  "sales-reps",
  "saved-for-later",
  "subscriptions",
  "tasks",
  "variations",
];
const VARIANTS = ["empty", "search", "error"];

function selectArg(options: string[]) {
  return {
    control: "select" as const,
    options,
    type: { name: "string" as const, required: false },
    table: { type: { summary: options.join(" | ") } },
  };
}

export default {
  title: "Components/Molecules/VcEmptyView",
  component: VcEmptyView,
  argTypes: {
    size: selectArg(SIZES),
    reason: selectArg(REASONS),
    entity: selectArg(ENTITIES),
    text: { control: "text" },
    description: { control: "text" },
    hint: { control: "text" },
    variant: selectArg(VARIANTS),
    icon: { control: "text" },
  },
} as Meta<typeof VcEmptyView>;

type StoryType = StoryObj<typeof VcEmptyView>;

export const Basic: StoryType = {
  args: {
    reason: "no-data",
    entity: "orders",
    text: "No orders yet",
    description: "Orders you place will appear here.",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `
      <VcEmptyView v-bind="args">
        <template #button>
          <VcButton>Start shopping</VcButton>
        </template>
      </VcEmptyView>
    `,
  }),
};

// One state at every size step. `auto` (not shown) picks sm / md / lg from the width it is given.
export const Sizes: StoryType = {
  render: () => ({
    setup: () => ({ sizes: ["xs", "sm", "md", "lg", "xl"] }),
    template: `
      <div class="flex flex-col gap-6">
        <div v-for="size in sizes" :key="size" class="rounded-[--vc-radius] border border-neutral-200">
          <VcEmptyView
            :size="size"
            reason="no-data"
            entity="lists"
            text="No lists yet"
            description="Create a list to save products you buy often and reorder them in one click."
          >
            <template #button>
              <VcButton :size="size === 'sm' ? 'sm' : 'md'">Create list</VcButton>
            </template>
          </VcEmptyView>
        </div>
      </div>
    `,
  }),
};

// The width decides the step: under 37.5rem sm, under 60rem md, wider lg.
export const AutoSize: StoryType = {
  render: () => ({
    setup: () => ({ widths: ["22rem", "45rem", "64rem"] }),
    template: `
      <div class="flex flex-col gap-6">
        <div v-for="width in widths" :key="width" class="rounded-[--vc-radius] border border-neutral-200" :style="{ width }">
          <VcEmptyView reason="no-results" text="No orders match your search" description="Check the order number.">
            <template #button>
              <VcButton variant="outline" color="secondary" prepend-icon="reset">Clear search</VcButton>
            </template>
          </VcEmptyView>
        </div>
      </div>
    `,
  }),
};

// Reason sets the tone and, for system reasons, the glyph and the drawn icon.
export const Reasons: StoryType = {
  render: () => ({
    setup: () => ({ reasons: REASONS }),
    template: `
      <div class="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-4">
        <div v-for="reason in reasons" :key="reason" class="rounded-[--vc-radius] border border-neutral-200">
          <VcEmptyView size="sm" :reason="reason" entity="orders" :text="reason" description="Description" />
        </div>
      </div>
    `,
  }),
};

// Content reasons show the entity: its glyph at S / M and its drawn icon at L / XL.
export const Entities: StoryType = {
  render: () => ({
    setup: () => ({ entities: ENTITIES }),
    template: `
      <div class="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
        <div v-for="entity in entities" :key="entity" class="rounded-[--vc-radius] border border-neutral-200">
          <VcEmptyView size="lg" reason="no-data" :entity="entity" :text="entity" />
        </div>
      </div>
    `,
  }),
};

export const StatusPage: StoryType = {
  args: {
    size: "xl",
    reason: "not-found",
    text: "Page not found",
    description: "The page may have moved or the link is out of date. Search the catalog or go back to the homepage.",
    hint: "Error code: 404",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `
      <VcEmptyView v-bind="args">
        <template #button>
          <VcButton variant="outline" color="secondary">Go to homepage</VcButton>
        </template>
      </VcEmptyView>
    `,
  }),
};

// Legacy props: variant maps to a reason, a known kit icon name to an entity.
export const LegacyProps: StoryType = {
  args: {
    variant: "search",
    icon: "outline-stock",
    text: "Nothing found",
  },
};
