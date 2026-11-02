import { MAIN_COLORS } from "@/ui-kit/constants";
import { VcTileButton } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const COLOR_OPTIONS = [...MAIN_COLORS];
const VARIANT_OPTIONS: VcTileButtonVariantType[] = ["solid", "outline"];

const meta: Meta<typeof VcTileButton> = {
  title: "Components/Molecules/VcTileButton",
  component: VcTileButton,
  argTypes: {
    variant: {
      control: "radio",
      options: VARIANT_OPTIONS,
      type: { name: "string", required: false },
      table: { type: { summary: VARIANT_OPTIONS.join(" | ") } },
    },
    color: {
      control: "select",
      options: COLOR_OPTIONS,
      type: { name: "string", required: false },
      table: { type: { summary: COLOR_OPTIONS.join(" | ") } },
    },
    disabled: { control: "boolean" },
  },
  args: {
    icon: "mail",
    variant: "solid",
    color: "primary",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<div class="max-w-44"><VcTileButton v-bind="args">Send email</VcTileButton></div>',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const renderTiles = (template: string) => (args: Record<string, unknown>) => ({
  setup: () => ({ args, colors: COLOR_OPTIONS }),
  template,
});

export const Basic: StoryType = {};

export const Outline: StoryType = {
  args: {
    variant: "outline",
  },
};

export const Colors: StoryType = {
  render: renderTiles(`<div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <VcTileButton v-for="color in colors" :key="color" v-bind="args" variant="solid" :color="color">{{ color }}</VcTileButton>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <VcTileButton v-for="color in colors" :key="color" v-bind="args" variant="outline" :color="color">{{ color }}</VcTileButton>
    </div>
  </div>`),
};

export const Disabled: StoryType = {
  render: renderTiles(`<div class="grid max-w-96 grid-cols-2 gap-3">
    <VcTileButton v-bind="args" variant="solid" disabled>Send email</VcTileButton>

    <VcTileButton v-bind="args" variant="outline" disabled>Send email</VcTileButton>
  </div>`),
};

export const Links: StoryType = {
  render: renderTiles(`<div class="grid max-w-96 grid-cols-2 gap-3">
    <VcTileButton v-bind="args" icon="home" to="/">Router link</VcTileButton>

    <VcTileButton v-bind="args" icon="external-link" variant="outline" external-link="https://virtocommerce.com" target="_blank">
      External link
    </VcTileButton>
  </div>`),
};

export const IconSlot: StoryType = {
  render: renderTiles(`<div class="grid max-w-96 grid-cols-2 gap-3">
    <VcTileButton v-bind="args">
      <template #icon>
        <span class="relative inline-flex">
          <VcIcon name="bell" />

          <VcBadge class="absolute -end-2 -top-2" color="danger" size="sm" rounded>3</VcBadge>
        </span>
      </template>

      Notifications
    </VcTileButton>

    <VcTileButton v-bind="args" variant="outline">
      <template #icon>
        <VcIcon name="mail" variant="solid" />
      </template>

      Send email
    </VcTileButton>
  </div>`),
};

export const LongLabel: StoryType = {
  render: renderTiles(`<div class="grid max-w-96 grid-cols-2 gap-3">
    <VcTileButton v-bind="args" icon="shopping-bag">Im Auftrag des Kunden bestellen</VcTileButton>

    <VcTileButton v-bind="args" variant="outline">Send email</VcTileButton>
  </div>`),
};

export const Grid: StoryType = {
  render: renderTiles(`<div class="grid max-w-96 auto-rows-fr grid-cols-2 gap-3">
    <VcTileButton icon="shopping-bag">Order on behalf</VcTileButton>

    <VcTileButton icon="mail" variant="outline">Send email</VcTileButton>

    <VcTileButton icon="receipt-tax" variant="outline" disabled>Create quote</VcTileButton>

    <VcTileButton icon="calendar" variant="outline" disabled>Schedule call</VcTileButton>
  </div>`),
};
