import { ref } from "vue";
import { VcModal } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const VARIANTS = ["primary", "secondary", "info", "success", "warning", "danger", "neutral", "accent"] as const;

const meta: Meta<typeof VcModal> = {
  title: "Components/Organisms/VcModal",
  component: VcModal,
  argTypes: {
    title: {
      control: "text",
      description: "Modal header title",
    },
    icon: {
      control: "text",
      description: "Icon name shown in the header",
    },
    variant: {
      control: "select",
      options: VARIANTS,
      description: "Color variant applied to the header icon",
    },
    dividers: {
      control: "boolean",
      description: "Adds dividers between header, content and footer",
    },
    scrollable: {
      control: "boolean",
      description: "Enables scrolling in the content area",
    },
    isPersistent: {
      control: "boolean",
      description: "Prevents closing by clicking the backdrop or pressing Escape",
    },
    hideActions: {
      control: "boolean",
      description: "Hides the footer actions area",
    },
  },
  args: {
    title: "Modal title",
    variant: "info",
    dividers: true,
    scrollable: true,
    isPersistent: false,
    hideActions: false,
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  render: (args) => ({
    setup: () => {
      const show = ref(false);
      return { args, show };
    },
    template: `<div>
      <VcButton @click="show = true">Open modal</VcButton>
      <VcModal v-bind="args" :show="show" @close="show = false">
        <p class="text-sm text-neutral-600">Modal body content goes here.</p>
      </VcModal>
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcModal title="Modal title" :show="show" @close="show = false">
            <p>Modal body content goes here.</p>
          </VcModal>
        `,
      },
    },
  },
};

export const WithIcon: StoryType = {
  args: {
    title: "Confirm action",
    icon: "information-circle",
    variant: "info",
  },
  render: (args) => ({
    setup: () => {
      const show = ref(false);
      return { args, show };
    },
    template: `<div>
      <VcButton @click="show = true">Open modal</VcButton>
      <VcModal v-bind="args" :show="show" @close="show = false">
        <p class="text-sm text-neutral-600">Please review the details before proceeding.</p>
      </VcModal>
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcModal title="Confirm action" icon="information-circle" variant="info" :show="show" @close="show = false">
            <p>Please review the details before proceeding.</p>
          </VcModal>
        `,
      },
    },
  },
};

export const WithCustomActions: StoryType = {
  args: {
    title: "Save changes",
    icon: "pencil",
    variant: "primary",
  },
  render: (args) => ({
    setup: () => {
      const show = ref(false);
      return { args, show };
    },
    template: `<div>
      <VcButton @click="show = true">Open modal</VcButton>
      <VcModal v-bind="args" :show="show" @close="show = false">
        <p class="text-sm text-neutral-600">You have unsaved changes. Would you like to save them?</p>
        <template #actions="{ close }">
          <VcButton variant="outline" color="secondary" @click="close">Discard</VcButton>
          <VcButton color="primary" @click="close">Save</VcButton>
        </template>
      </VcModal>
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcModal title="Save changes" :show="show" @close="show = false">
            <p>You have unsaved changes. Would you like to save them?</p>
            <template #actions="{ close }">
              <VcButton variant="outline" color="secondary" @click="close">Discard</VcButton>
              <VcButton color="primary" @click="close">Save</VcButton>
            </template>
          </VcModal>
        `,
      },
    },
  },
};

export const Persistent: StoryType = {
  args: {
    title: "Session expired",
    icon: "lock-closed",
    variant: "warning",
    isPersistent: true,
  },
  render: (args) => ({
    setup: () => {
      const show = ref(false);
      return { args, show };
    },
    template: `<div>
      <VcButton @click="show = true">Open modal</VcButton>
      <VcModal v-bind="args" :show="show" @close="show = false">
        <p class="text-sm text-neutral-600">Your session has expired. Please log in again to continue.</p>
        <template #actions>
          <VcButton color="primary" @click="show = false">Log in again</VcButton>
        </template>
      </VcModal>
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcModal title="Session expired" is-persistent :show="show" @close="show = false">
            <p>Your session has expired. Please log in again.</p>
            <template #actions>
              <VcButton color="primary">Log in again</VcButton>
            </template>
          </VcModal>
        `,
      },
    },
  },
};

export const ScrollableContent: StoryType = {
  args: {
    title: "Terms and conditions",
    maxHeight: "24rem",
  },
  render: (args) => ({
    setup: () => {
      const show = ref(false);
      return { args, show };
    },
    template: `<div>
      <VcButton @click="show = true">Open modal</VcButton>
      <VcModal v-bind="args" :show="show" @close="show = false">
        <p v-for="i in 12" :key="i" class="mb-3 text-sm text-neutral-600">
          Section {{ i }}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <template #actions="{ close }">
          <VcButton variant="outline" color="secondary" @click="close">Decline</VcButton>
          <VcButton color="primary" @click="close">Accept</VcButton>
        </template>
      </VcModal>
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcModal title="Terms and conditions" max-height="24rem" :show="show" @close="show = false">
            Long content…
            <template #actions="{ close }">
              <VcButton variant="outline" color="secondary" @click="close">Decline</VcButton>
              <VcButton color="primary" @click="close">Accept</VcButton>
            </template>
          </VcModal>
        `,
      },
    },
  },
};
