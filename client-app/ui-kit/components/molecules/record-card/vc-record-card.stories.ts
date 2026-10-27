import { VcRecordCard } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcRecordCard> = {
  title: "Components/Molecules/VcRecordCard",
  component: VcRecordCard,
  // Menus inside the card float in the app-level popover host, as in the storefront.
  decorators: [() => ({ template: '<div id="popover-host"></div><story />' })],
  argTypes: {
    target: {
      control: "radio",
      options: ["_self", "_blank"],
      type: { name: "string", required: false },
    },
    disabled: { control: "boolean" },
  },
  args: {
    title: "10479",
    to: "/",
    description: "May 9, 2026",
    metric: "$15,640.75",
    meta: [
      { icon: "building-2", text: "Northwind Supply Co." },
      { icon: "credit-card", text: "Credit card" },
    ],
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<div class="max-w-sm">
      <VcRecordCard v-bind="args">
        <template #menu>
          <VcMenuItem color="secondary">
            <VcIcon name="eye" />
            <span>View</span>
          </VcMenuItem>

          <VcMenuItem color="secondary">
            <VcIcon name="refresh-cw" />
            <span>Reorder</span>
          </VcMenuItem>
        </template>

        <template #status>
          <VcBadge color="success" variant="outline" rounded>Completed</VcBadge>
        </template>
      </VcRecordCard>
    </div>`,
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const renderCard = (template: string) => (args: Record<string, unknown>) => ({
  setup: () => ({ args }),
  template: `<div class="flex max-w-sm flex-col gap-3">${template}</div>`,
});

export const Basic: StoryType = {};

export const WithAvatar: StoryType = {
  args: {
    title: "Priya Raman",
    initials: "PR",
    to: null,
    description: "priya.raman@northwind.co",
    metric: undefined,
    meta: [
      { icon: "shield-check", text: "Purchasing manager" },
      { icon: "phone", text: "+1 (206) 555-0142" },
    ],
  },
  render: renderCard(`<VcRecordCard v-bind="args">
    <template #menu>
      <VcMenuItem color="secondary">
        <VcIcon name="pencil" />
        <span>Edit role</span>
      </VcMenuItem>
    </template>

    <template #status>
      <VcBadge color="success" variant="outline" rounded>Active</VcBadge>
    </template>
  </VcRecordCard>`),
};

export const Notification: StoryType = {
  args: {
    title: "Order shipped",
    to: null,
    description: "Order 10482 has been shipped. Track it any time in Order details.",
    metric: undefined,
    meta: [{ icon: "clock", text: "2h ago" }],
  },
  render: renderCard(`<VcRecordCard v-bind="args">
    <template #lead>
      <VcBadge color="accent" size="xs" rounded />
    </template>

    <template #menu>
      <VcMenuItem color="secondary">
        <VcIcon name="mail-open" />
        <span>Mark as read</span>
      </VcMenuItem>
    </template>

    <template #status>
      <VcChip color="neutral" variant="outline" size="xs" icon="package" rounded>Order update</VcChip>
    </template>
  </VcRecordCard>`),
};

export const Minimal: StoryType = {
  args: {
    title: "Spring restock",
    meta: [],
    metric: undefined,
    description: "Applied automatically at checkout",
  },
  render: renderCard(`<VcRecordCard v-bind="args" />`),
};

export const Disabled: StoryType = {
  args: {
    disabled: true,
  },
};
