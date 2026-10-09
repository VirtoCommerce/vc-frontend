import { VcButton, VcDialog, VcDialogContent, VcDialogFooter, VcDialogHeader } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcDialogFooter> = {
  title: "Components/Molecules/VcDialogFooter",
  component: VcDialogFooter,
  decorators: [
    () => ({
      template: '<div class="w-96"><story /></div>',
    }),
  ],
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  render: () => ({
    components: { VcDialog, VcDialogHeader, VcDialogContent, VcDialogFooter },
    template: `<VcDialog dividers>
      <VcDialogHeader>Dialog Title</VcDialogHeader>
      <VcDialogContent><p class="text-sm text-neutral-600">Dialog body content.</p></VcDialogContent>
      <VcDialogFooter />
    </VcDialog>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcDialog dividers>
            <VcDialogHeader>Dialog Title</VcDialogHeader>
            <VcDialogContent>Dialog body content.</VcDialogContent>
            <VcDialogFooter @close="onClose" />
          </VcDialog>
        `,
      },
    },
  },
};

export const WithCustomActions: StoryType = {
  render: () => ({
    components: { VcDialog, VcDialogHeader, VcDialogContent, VcDialogFooter, VcButton },
    template: `<VcDialog dividers>
      <VcDialogHeader>Confirm action</VcDialogHeader>
      <VcDialogContent><p class="text-sm text-neutral-600">Are you sure you want to proceed?</p></VcDialogContent>
      <VcDialogFooter>
        <VcButton variant="outline" color="secondary">Cancel</VcButton>
        <VcButton color="primary">Confirm</VcButton>
      </VcDialogFooter>
    </VcDialog>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcDialogFooter>
            <VcButton variant="outline" color="secondary">Cancel</VcButton>
            <VcButton color="primary">Confirm</VcButton>
          </VcDialogFooter>
        `,
      },
    },
  },
};

export const WithLeadingAction: StoryType = {
  render: () => ({
    components: { VcDialog, VcDialogHeader, VcDialogContent, VcDialogFooter, VcButton },
    template: `<VcDialog dividers>
      <VcDialogHeader>Edit item</VcDialogHeader>
      <VcDialogContent><p class="text-sm text-neutral-600">Make your changes below.</p></VcDialogContent>
      <VcDialogFooter>
        <VcButton variant="outline" color="danger">Delete</VcButton>
        <VcButton variant="outline" color="secondary">Cancel</VcButton>
        <VcButton color="primary">Save changes</VcButton>
      </VcDialogFooter>
    </VcDialog>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcDialogFooter>
            <VcButton variant="outline" color="danger">Delete</VcButton>
            <VcButton variant="outline" color="secondary">Cancel</VcButton>
            <VcButton color="primary">Save changes</VcButton>
          </VcDialogFooter>
        `,
      },
    },
  },
};
