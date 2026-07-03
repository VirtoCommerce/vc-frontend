import { VcDialog, VcDialogContent, VcDialogFooter, VcDialogHeader } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcDialogContent> = {
  title: "Components/Molecules/VcDialogContent",
  component: VcDialogContent,
  argTypes: {
    scrollable: {
      control: "boolean",
      description: "Enables vertical scrolling when content exceeds the container height",
    },
  },
  args: {
    scrollable: true,
  },
  decorators: [
    () => ({
      template: '<div class="w-96"><story /></div>',
    }),
  ],
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  render: (args) => ({
    components: { VcDialog, VcDialogHeader, VcDialogContent, VcDialogFooter },
    setup: () => ({ args }),
    template: `<VcDialog dividers>
      <VcDialogHeader>Dialog Title</VcDialogHeader>
      <VcDialogContent v-bind="args">
        <p class="text-sm text-neutral-600">
          This is the main content area of the dialog. It supports any HTML content
          and wraps it in a padded container.
        </p>
      </VcDialogContent>
      <VcDialogFooter />
    </VcDialog>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcDialog dividers>
            <VcDialogHeader>Dialog Title</VcDialogHeader>
            <VcDialogContent>
              <p>Dialog body content goes here.</p>
            </VcDialogContent>
            <VcDialogFooter />
          </VcDialog>
        `,
      },
    },
  },
};

export const Scrollable: StoryType = {
  decorators: [
    () => ({
      template: '<div class="w-96 h-72"><story /></div>',
    }),
  ],
  render: (args) => ({
    components: { VcDialog, VcDialogHeader, VcDialogContent, VcDialogFooter },
    setup: () => ({ args }),
    template: `<VcDialog dividers class="h-full">
      <VcDialogHeader>Long content</VcDialogHeader>
      <VcDialogContent v-bind="args">
        <p v-for="i in 10" :key="i" class="mb-3 text-sm text-neutral-600">
          Paragraph {{ i }}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </VcDialogContent>
      <VcDialogFooter />
    </VcDialog>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcDialog dividers>
            <VcDialogHeader>Long content</VcDialogHeader>
            <VcDialogContent scrollable>
              Long scrollable content…
            </VcDialogContent>
            <VcDialogFooter />
          </VcDialog>
        `,
      },
    },
  },
};
