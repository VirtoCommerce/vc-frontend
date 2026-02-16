import { VcDialog } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];

const meta: Meta<typeof VcDialog> = {
  title: "Components/Atoms/VcDialog",
  component: VcDialog,
  argTypes: {
    size: {
      control: "select",
      options: SIZES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: SIZES.join(" | "),
        },
      },
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `
      <VcDialog v-bind="args">
        <VcDialogHeader>Title</VcDialogHeader>
        <VcDialogContent>Content</VcDialogContent>
        <VcDialogFooter />
      </VcDialog>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcDialog v-bind="args">
            <VcDialogHeader>Title</VcDialogHeader>
            <VcDialogContent>Content</VcDialogContent>
            <VcDialogFooter />
          </VcDialog>
        `,
      },
    },
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {},
  parameters: {
    docs: {
      source: {
        code: `
          <VcDialog>
            <VcDialogHeader>Title</VcDialogHeader>
            <VcDialogContent>Content</VcDialogContent>
            <VcDialogFooter />
          </VcDialog>
        `,
      },
    },
  },
};

export const Dividers: StoryType = {
  args: {
    dividers: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcDialog dividers>
            <VcDialogHeader>Title</VcDialogHeader>
            <VcDialogContent>Content</VcDialogContent>
            <VcDialogFooter />
          </VcDialog>
        `,
      },
    },
  },
};

export const Icon: StoryType = {
  args: {},
  render: (args) => ({
    setup: () => ({ args }),
    template: `
      <VcDialog v-bind="args">
        <VcDialogHeader icon="check">Title</VcDialogHeader>
        <VcDialogContent>Content</VcDialogContent>
        <VcDialogFooter />
      </VcDialog>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcDialog>
            <VcDialogHeader icon="check">Title</VcDialogHeader>
            <VcDialogContent>Content</VcDialogContent>
            <VcDialogFooter />
          </VcDialog>
        `,
      },
    },
  },
};

export const SizeXS: StoryType = {
  args: {
    size: "xs",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcDialog size="xs">
            <VcDialogHeader>Title</VcDialogHeader>
            <VcDialogContent>Content</VcDialogContent>
            <VcDialogFooter />
          </VcDialog>
        `,
      },
    },
  },
};

export const SizeSM: StoryType = {
  args: {
    size: "sm",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcDialog size="sm">
            <VcDialogHeader>Title</VcDialogHeader>
            <VcDialogContent>Content</VcDialogContent>
            <VcDialogFooter />
          </VcDialog>
        `,
      },
    },
  },
};

export const SizeMD: StoryType = {
  args: {
    size: "md",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcDialog size="md">
            <VcDialogHeader>Title</VcDialogHeader>
            <VcDialogContent>Content</VcDialogContent>
            <VcDialogFooter />
          </VcDialog>
        `,
      },
    },
  },
};
