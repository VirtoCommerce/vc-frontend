import { VcEmptyView } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const VARIANTS = ["empty", "search"];
const ICONS = ["", "outline-stock", "outline-order", "outline-list"];

export default {
  title: "Components/Molecules/VcEmptyView",
  component: VcEmptyView,
  argTypes: {
    variant: {
      control: "inline-radio",
      options: VARIANTS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: VARIANTS.join(" | "),
        },
      },
    },
    icon: {
      control: "select",
      options: ICONS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: "string",
        },
      },
    },
    text: {
      control: "text",
      type: { name: "string", required: false },
      table: {
        type: {
          summary: "string",
        },
      },
    },
  },
} as Meta<typeof VcEmptyView>;

type StoryType = StoryObj<typeof VcEmptyView>;

export const Basic: StoryType = {
  args: {
    text: "List is empty",
  },
};

export const WithIcon: StoryType = {
  args: {
    text: "List is empty",
    icon: "outline-stock",
  },
};

export const SearchVariant: StoryType = {
  args: {
    variant: "search",
    text: "Nothing found",
  },
};

export const WithButton: StoryType = {
  args: {
    text: "Product list is empty",
    icon: "outline-stock",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `
      <VcEmptyView v-bind="args">
        <template #button>
          <VcButton color="primary" variant="solid">
            Add Product
          </VcButton>
        </template>
      </VcEmptyView>
    `,
  }),
};

export const WithMultipleButtons: StoryType = {
  args: {
    text: "No data to display",
    icon: "outline-stock",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `
      <VcEmptyView v-bind="args">
        <template #button>
          <div class="flex gap-3">
            <VcButton color="primary" variant="solid">
              Create
            </VcButton>
            <VcButton color="secondary" variant="outline">
              Import
            </VcButton>
          </div>
        </template>
      </VcEmptyView>
    `,
  }),
};
