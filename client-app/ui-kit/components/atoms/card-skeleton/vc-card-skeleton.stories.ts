import { VcCardSkeleton } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcCardSkeleton> = {
  title: "Components/Atoms/VcCardSkeleton",
  component: VcCardSkeleton,
  argTypes: {
    isCollapsible: {
      control: "boolean",
      description: "Shows a collapse indicator in the header",
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcCardSkeleton v-bind="args"><div class="h-24 rounded bg-neutral-100" /></VcCardSkeleton>',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    isCollapsible: false,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcCardSkeleton :is-collapsible="false" />`,
      },
    },
  },
};

export const Collapsible: StoryType = {
  args: {
    isCollapsible: true,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcCardSkeleton :is-collapsible="true" />`,
      },
    },
  },
};
