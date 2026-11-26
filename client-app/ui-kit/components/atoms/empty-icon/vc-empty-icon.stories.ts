import { VcEmptyIcon } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const NAMES: VcEmptyIconNameType[] = [
  "access-denied",
  "account-blocked",
  "addresses",
  "back-in-stock",
  "cart",
  "catalog",
  "compare",
  "coupons",
  "customers",
  "dashboard-hidden",
  "documents",
  "error",
  "lists",
  "members",
  "missions",
  "no-results",
  "not-found",
  "nothing-found",
  "notifications",
  "order-completed",
  "orders",
  "payment-methods",
  "points",
  "purchase-requests",
  "quotes",
  "registration-completed",
  "returns",
  "sales-reps",
  "saved-for-later",
  "subscriptions",
  "tasks",
];

const meta: Meta<typeof VcEmptyIcon> = {
  title: "Components/Atoms/VcEmptyIcon",
  component: VcEmptyIcon,
  argTypes: {
    name: {
      control: "select",
      options: NAMES,
      description: "Drawn empty-state icon (file name in ui-kit/images/empty-states)",
    },
    size: {
      control: "text",
      description: "Width and height: a number in px or a CSS length. Default 10rem",
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcEmptyIcon v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    name: "cart",
  },
};

export const Size: StoryType = {
  args: {
    name: "orders",
    size: 120,
  },
};

export const AllIcons: StoryType = {
  render: () => ({
    components: { VcEmptyIcon },
    setup: () => ({ names: NAMES }),
    template: `
      <div class="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-6">
        <div v-for="name in names" :key="name" class="flex flex-col items-center gap-2">
          <VcEmptyIcon :name="name" :size="96" />
          <span class="text-xs font-mono">{{ name }}</span>
        </div>
      </div>
    `,
  }),
};
