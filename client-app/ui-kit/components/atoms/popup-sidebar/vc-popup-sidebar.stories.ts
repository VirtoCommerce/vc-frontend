import { ref } from "vue";
import { VcPopupSidebar } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcPopupSidebar> = {
  title: "Components/Atoms/VcPopupSidebar",
  component: VcPopupSidebar,
  args: {
    isVisible: false,
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  render: (args) => ({
    setup: () => {
      const isVisible = ref(args.isVisible ?? false);
      return { args, isVisible };
    },
    template: `<div>
      <VcButton @click="isVisible = true">Open sidebar</VcButton>
      <VcPopupSidebar v-bind="args" :is-visible="isVisible" @hide="isVisible = false">
        <p class="text-sm">Sidebar content goes here.</p>
      </VcPopupSidebar>
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcButton @click="isVisible = true">Open sidebar</VcButton>
          <VcPopupSidebar :is-visible="isVisible" @hide="isVisible = false">
            <p>Sidebar content goes here.</p>
          </VcPopupSidebar>
        `,
      },
    },
  },
};

export const WithTitle: StoryType = {
  args: {
    title: "Custom Title",
  },
  render: (args) => ({
    setup: () => {
      const isVisible = ref(false);
      return { args, isVisible };
    },
    template: `<div>
      <VcButton @click="isVisible = true">Open sidebar</VcButton>
      <VcPopupSidebar v-bind="args" :is-visible="isVisible" @hide="isVisible = false">
        <p class="text-sm">Sidebar content goes here.</p>
      </VcPopupSidebar>
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcPopupSidebar title="Custom Title" :is-visible="isVisible" @hide="isVisible = false">
            <p>Sidebar content goes here.</p>
          </VcPopupSidebar>
        `,
      },
    },
  },
};

export const WithFooter: StoryType = {
  render: (args) => ({
    setup: () => {
      const isVisible = ref(false);
      return { args, isVisible };
    },
    template: `<div>
      <VcButton @click="isVisible = true">Open sidebar</VcButton>
      <VcPopupSidebar v-bind="args" :is-visible="isVisible" @hide="isVisible = false">
        <p class="text-sm">Filter options go here.</p>
        <template #footer>
          <VcButton color="primary" @click="isVisible = false">Apply</VcButton>
          <VcButton variant="outline" @click="isVisible = false">Reset</VcButton>
        </template>
      </VcPopupSidebar>
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcPopupSidebar :is-visible="isVisible" @hide="isVisible = false">
            <p>Filter options go here.</p>
            <template #footer>
              <VcButton color="primary" @click="isVisible = false">Apply</VcButton>
              <VcButton variant="outline" @click="isVisible = false">Reset</VcButton>
            </template>
          </VcPopupSidebar>
        `,
      },
    },
  },
};
