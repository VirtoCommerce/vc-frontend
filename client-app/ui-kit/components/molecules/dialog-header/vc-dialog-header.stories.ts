import { VcDialog } from "@/ui-kit/components/atoms";
import { VcDialogContent, VcDialogFooter, VcDialogHeader } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const COLORS = ["primary", "secondary", "success", "info", "warning", "danger", "neutral", "accent"] as const;
const SIZES = ["xs", "sm", "md"] as const;

const meta: Meta<typeof VcDialogHeader> = {
  title: "Components/Molecules/VcDialogHeader",
  component: VcDialogHeader,
  argTypes: {
    color: {
      control: "select",
      options: COLORS,
      description: "Icon and accent color",
    },
    icon: {
      control: "text",
      description: "Icon name shown before the title",
    },
    closable: {
      control: "boolean",
      description: "Shows the close (×) button",
    },
    size: {
      control: "inline-radio",
      options: SIZES,
      description: "Header height and font size variant",
    },
  },
  args: {
    icon: "case",
    color: "info",
    closable: true,
    size: "md",
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
      <VcDialogHeader v-bind="args">Dialog Title</VcDialogHeader>
      <VcDialogContent><p class="text-sm text-neutral-600">Dialog body content.</p></VcDialogContent>
      <VcDialogFooter />
    </VcDialog>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcDialog dividers>
            <VcDialogHeader @close="onClose">Dialog Title</VcDialogHeader>
            <VcDialogContent>Dialog body content.</VcDialogContent>
            <VcDialogFooter />
          </VcDialog>
        `,
      },
    },
  },
};

export const WithIcon: StoryType = {
  args: {
    icon: "check-circle",
    color: "success",
  },
  render: (args) => ({
    components: { VcDialog, VcDialogHeader, VcDialogContent, VcDialogFooter },
    setup: () => ({ args }),
    template: `<VcDialog dividers>
      <VcDialogHeader v-bind="args">Action completed</VcDialogHeader>
      <VcDialogContent><p class="text-sm text-neutral-600">Your changes have been saved successfully.</p></VcDialogContent>
      <VcDialogFooter />
    </VcDialog>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcDialog dividers>
            <VcDialogHeader icon="check-circle" color="success" @close="onClose">Action completed</VcDialogHeader>
            <VcDialogContent>Your changes have been saved successfully.</VcDialogContent>
            <VcDialogFooter />
          </VcDialog>
        `,
      },
    },
  },
};

export const NotClosable: StoryType = {
  args: {
    closable: false,
  },
  render: (args) => ({
    components: { VcDialog, VcDialogHeader, VcDialogContent, VcDialogFooter },
    setup: () => ({ args }),
    template: `<VcDialog dividers>
      <VcDialogHeader v-bind="args">Processing request…</VcDialogHeader>
      <VcDialogContent><p class="text-sm text-neutral-600">Please wait while we process your request.</p></VcDialogContent>
      <VcDialogFooter />
    </VcDialog>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcDialog dividers>
            <VcDialogHeader :closable="false">Processing request…</VcDialogHeader>
            <VcDialogContent>Please wait while we process your request.</VcDialogContent>
            <VcDialogFooter />
          </VcDialog>
        `,
      },
    },
  },
};

export const Colors: StoryType = {
  render: () => ({
    components: { VcDialog, VcDialogHeader, VcDialogContent, VcDialogFooter },
    setup: () => ({ colors: COLORS }),
    template: `<div class="flex flex-col gap-4">
      <VcDialog v-for="color in colors" :key="color" dividers>
        <VcDialogHeader :color="color" icon="bell">
          {{ color.charAt(0).toUpperCase() + color.slice(1) }} header
        </VcDialogHeader>
        <VcDialogContent><p class="text-sm text-neutral-600">Dialog body content.</p></VcDialogContent>
        <VcDialogFooter />
      </VcDialog>
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `<VcDialogHeader color="danger" icon="bell" @close="onClose">Danger header</VcDialogHeader>`,
      },
    },
  },
};

export const Sizes: StoryType = {
  render: () => ({
    components: { VcDialog, VcDialogHeader, VcDialogContent, VcDialogFooter },
    setup: () => ({ sizes: SIZES }),
    template: `<div class="flex flex-col gap-4">
      <VcDialog v-for="size in sizes" :key="size" :size="size" dividers>
        <VcDialogHeader :size="size" icon="information-circle">Size {{ size }}</VcDialogHeader>
        <VcDialogContent><p class="text-sm text-neutral-600">Dialog body content.</p></VcDialogContent>
        <VcDialogFooter />
      </VcDialog>
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `<VcDialogHeader size="sm">Small header</VcDialogHeader>`,
      },
    },
  },
};
