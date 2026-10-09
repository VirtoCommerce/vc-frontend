import { ref } from "vue";
import { VcConfirmationModal } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const VARIANTS = ["primary", "secondary", "info", "success", "warning", "danger", "neutral", "accent"] as const;

const meta: Meta<typeof VcConfirmationModal> = {
  title: "Components/Organisms/VcConfirmationModal",
  component: VcConfirmationModal,
  argTypes: {
    title: {
      control: "text",
      description: "Modal header title",
    },
    text: {
      control: "text",
      description: "Confirmation message displayed in the body",
    },
    icon: {
      control: "text",
      description: "Icon name shown in the header",
    },
    variant: {
      control: "select",
      options: VARIANTS,
      description: "Color variant for the header icon and confirm button",
    },
    singleButton: {
      control: "boolean",
      description: "Hides the cancel button, showing only the confirm button",
    },
    loading: {
      control: "boolean",
      description: "Shows a loading state on the confirm button",
    },
  },
  args: {
    title: "Confirm action",
    text: "Are you sure you want to proceed? This action cannot be undone.",
    icon: "warning",
    variant: "danger",
    singleButton: false,
    loading: false,
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
      <VcButton color="danger" @click="show = true">Delete item</VcButton>
      <VcConfirmationModal v-if="show" v-bind="args" @confirm="show = false" @close="show = false" />
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcConfirmationModal
            title="Confirm action"
            text="Are you sure you want to proceed? This action cannot be undone."
            @confirm="onConfirm"
            @close="onClose"
          />
        `,
      },
    },
  },
};

export const SingleButton: StoryType = {
  args: {
    title: "Action completed",
    text: "Your changes have been saved successfully.",
    icon: "check-circle",
    variant: "success",
    singleButton: true,
  },
  render: (args) => ({
    setup: () => {
      const show = ref(false);
      return { args, show };
    },
    template: `<div>
      <VcButton color="success" @click="show = true">Show notification</VcButton>
      <VcConfirmationModal v-if="show" v-bind="args" @confirm="show = false" @close="show = false" />
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcConfirmationModal
            single-button
            title="Action completed"
            text="Your changes have been saved successfully."
            icon="check-circle"
            variant="success"
            @confirm="onConfirm"
            @close="onClose"
          />
        `,
      },
    },
  },
};

export const LoadingState: StoryType = {
  args: {
    title: "Delete product",
    text: "This product will be permanently deleted. Are you sure?",
    loading: true,
  },
  render: (args) => ({
    setup: () => {
      const show = ref(false);
      return { args, show };
    },
    template: `<div>
      <VcButton color="danger" @click="show = true">Delete product</VcButton>
      <VcConfirmationModal v-if="show" v-bind="args" @confirm="show = false" @close="show = false" />
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcConfirmationModal
            title="Delete product"
            text="This product will be permanently deleted. Are you sure?"
            :loading="isDeleting"
            @confirm="onConfirm"
            @close="onClose"
          />
        `,
      },
    },
  },
};

export const Variants: StoryType = {
  render: () => ({
    setup: () => {
      const activeVariant = ref<string | null>(null);
      const variants = VARIANTS;
      return { activeVariant, variants };
    },
    template: `<div class="flex flex-wrap gap-2">
      <VcButton
        v-for="variant in variants"
        :key="variant"
        :color="variant"
        @click="activeVariant = variant"
      >
        {{ variant }}
      </VcButton>
      <VcConfirmationModal
        v-if="activeVariant"
        :variant="activeVariant"
        :title="activeVariant + ' confirmation'"
        :icon="activeVariant === 'danger' ? 'warning' : 'information-circle'"
        text="Are you sure you want to proceed with this action?"
        @confirm="activeVariant = null"
        @close="activeVariant = null"
      />
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcConfirmationModal
            variant="warning"
            title="Warning"
            icon="warning"
            text="Are you sure you want to proceed?"
            @confirm="onConfirm"
            @close="onClose"
          />
        `,
      },
    },
  },
};
