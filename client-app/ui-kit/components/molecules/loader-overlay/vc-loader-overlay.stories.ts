import { VcLoaderOverlay } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcLoaderOverlay> = {
  title: "Components/Molecules/VcLoaderOverlay",
  component: VcLoaderOverlay,
  argTypes: {
    visible: {
      control: "boolean",
      description: "Shows or hides the overlay",
    },
    noBg: {
      control: "boolean",
      description: "Removes the semi-transparent background, showing only the spinner",
    },
    fixedSpinner: {
      control: "boolean",
      description: "Fixes the spinner position relative to the viewport instead of the parent",
    },
  },
  args: {
    visible: true,
    noBg: false,
    fixedSpinner: false,
  },
  decorators: [
    () => ({
      template: `<div class="relative h-40 w-80 rounded border bg-additional-50 p-4">
        <p class="text-sm text-neutral-600">Content underneath the overlay</p>
        <story />
      </div>`,
    }),
  ],
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  parameters: {
    docs: {
      source: {
        code: `
          <div class="relative">
            <YourContent />
            <VcLoaderOverlay :visible="isLoading" />
          </div>
        `,
      },
    },
  },
};

export const NoBg: StoryType = {
  args: {
    noBg: true,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcLoaderOverlay :visible="isLoading" no-bg />`,
      },
    },
  },
};

export const Hidden: StoryType = {
  args: {
    visible: false,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcLoaderOverlay :visible="false" />`,
      },
    },
  },
};
