import { VcLoaderWithText } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcLoaderWithText> = {
  title: "Components/Molecules/VcLoaderWithText",
  component: VcLoaderWithText,
  argTypes: {
    centered: {
      control: "boolean",
      description: "Centers the loader and text horizontally",
    },
  },
  args: {
    centered: false,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcLoaderWithText v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  parameters: {
    docs: {
      source: {
        code: `<VcLoaderWithText />`,
      },
    },
  },
};

export const Centered: StoryType = {
  args: {
    centered: true,
  },
  decorators: [
    () => ({
      template: '<div class="h-32 w-full"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      source: {
        code: `<VcLoaderWithText centered />`,
      },
    },
  },
};

export const CustomText: StoryType = {
  args: {
    text: "Fetching your order…",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcLoaderWithText text="Fetching your order…" />`,
      },
    },
  },
};
