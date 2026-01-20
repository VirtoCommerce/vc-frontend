import { VcLayout } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcLayout> = {
  title: "Components/Atoms/VcLayout",
  component: VcLayout,
  argTypes: {
    sidebarPosition: {
      control: "inline-radio",
      options: ["left", "right"],
      description: "Sidebar position",
    },
    sticky: {
      control: "boolean",
      description: "Enable smart sticky behavior",
    },
    sidebarAriaLabel: {
      control: "text",
      description: "Accessibility label for sidebar",
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `
      <VcLayout v-bind="args">
        <template #sidebar>
          <div class="p-4 bg-neutral-100 rounded">Sidebar content</div>
        </template>
        <div class="p-4 bg-neutral-50 rounded">Main content</div>
      </VcLayout>
    `,
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {},
  parameters: {
    docs: {
      source: {
        code: `
          <VcLayout>
            <template #sidebar>
              <div>Sidebar content</div>
            </template>
            <div>Main content</div>
          </VcLayout>
        `,
      },
    },
  },
};

export const SidebarRight: StoryType = {
  args: {
    sidebarPosition: "right",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcLayout sidebar-position="right">
            <template #sidebar>
              <div>Sidebar content</div>
            </template>
            <div>Main content</div>
          </VcLayout>
        `,
      },
    },
  },
};

export const WithoutSidebar: StoryType = {
  args: {},
  render: (args) => ({
    setup: () => ({ args }),
    template: `
      <VcLayout v-bind="args">
        <div class="p-4 bg-neutral-50 rounded">Main content only</div>
      </VcLayout>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcLayout>
            <div>Main content only</div>
          </VcLayout>
        `,
      },
    },
  },
};
