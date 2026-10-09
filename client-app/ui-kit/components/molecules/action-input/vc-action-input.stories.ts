import { VcActionInput } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcActionInput> = {
  title: "Components/Molecules/VcActionInput",
  component: VcActionInput,
  argTypes: {
    modelValue: {
      control: "text",
      description: "Input value (v-model)",
    },
    label: {
      control: "text",
      description: "Label displayed above the input",
    },
    placeholder: {
      control: "text",
      description: "Input placeholder text",
    },
    errorMessage: {
      control: "text",
      description: "Validation error message",
    },
    applied: {
      control: "boolean",
      description: "When true, shows the deny (remove) button instead of the apply button",
    },
    disabled: {
      control: "boolean",
      description: "Disables the input and action buttons",
    },
    readonly: {
      control: "boolean",
      description: "Makes the input read-only and hides action buttons",
    },
    maxLength: {
      control: "number",
      description: "Maximum number of characters allowed",
    },
  },
  args: {
    modelValue: "",
    applied: false,
    disabled: false,
    readonly: false,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcActionInput v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    placeholder: "Enter value",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcActionInput v-model="value" placeholder="Enter value" />
        `,
      },
    },
  },
};

export const WithLabel: StoryType = {
  args: {
    label: "Promo code",
    placeholder: "Enter promo code",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcActionInput v-model="value" label="Promo code" placeholder="Enter promo code" />
        `,
      },
    },
  },
};

export const WithError: StoryType = {
  args: {
    label: "Promo code",
    placeholder: "Enter promo code",
    errorMessage: "Invalid promo code",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcActionInput
            v-model="value"
            label="Promo code"
            placeholder="Enter promo code"
            error-message="Invalid promo code"
          />
        `,
      },
    },
  },
};

export const Disabled: StoryType = {
  args: {
    label: "Promo code",
    placeholder: "Enter promo code",
    disabled: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcActionInput v-model="value" label="Promo code" placeholder="Enter promo code" disabled />
        `,
      },
    },
  },
};

export const Readonly: StoryType = {
  args: {
    label: "Promo code",
    placeholder: "Enter promo code",
    readonly: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcActionInput v-model="value" label="Promo code" placeholder="Enter promo code" readonly />
        `,
      },
    },
  },
};
