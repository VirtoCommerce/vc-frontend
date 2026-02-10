import { VcInfinityScrollLoader } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcInfinityScrollLoader> = {
  title: "Components/Atoms/VcInfinityScrollLoader",
  component: VcInfinityScrollLoader,
  argTypes: {
    loading: {
      control: "boolean",
      description: "Show loading state",
    },
    pagesCount: {
      control: "number",
      description: "Total number of pages",
    },
    pageNumber: {
      control: "number",
      description: "Current page number",
    },
    isPageLimitReached: {
      control: "boolean",
      description: "Whether page limit is reached",
    },
    distance: {
      control: "number",
      description: "Distance from viewport to trigger loading",
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcInfinityScrollLoader v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Loading: StoryType = {
  args: {
    loading: true,
    pagesCount: 10,
    pageNumber: 1,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcInfinityScrollLoader :loading="true" :pages-count="10" :page-number="1" />
        `,
      },
    },
  },
};

export const EndOfList: StoryType = {
  args: {
    loading: false,
    pagesCount: 5,
    pageNumber: 5,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcInfinityScrollLoader :loading="false" :pages-count="5" :page-number="5" />
        `,
      },
    },
  },
};
