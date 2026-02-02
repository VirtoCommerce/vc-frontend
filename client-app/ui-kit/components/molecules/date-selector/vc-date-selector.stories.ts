import { VcDateSelector } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md", "auto"];

const meta: Meta<typeof VcDateSelector> = {
  title: "Components/Molecules/VcDateSelector",
  component: VcDateSelector,
  argTypes: {
    label: {
      control: "text",
      description: "Input label",
      table: { type: { summary: "string" } },
    },
    name: {
      control: "text",
      description: "Input name attribute",
      table: { type: { summary: "string" } },
    },
    modelValue: {
      control: "text",
      description: "Selected date value in YYYY-MM-DD format",
      table: { type: { summary: "string" } },
    },
    required: {
      control: "boolean",
      table: { type: { summary: "boolean" } },
    },
    disabled: {
      control: "boolean",
      table: { type: { summary: "boolean" } },
    },
    size: {
      control: "radio",
      options: SIZES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: SIZES.join(" | "),
        },
      },
    },
    min: {
      control: "text",
      description: "Minimum date in YYYY-MM-DD format",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    max: {
      control: "text",
      description: "Maximum date in YYYY-MM-DD format",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    errorMessage: {
      control: "text",
      table: { type: { summary: "string" } },
    },
    // deprecated props
    isRequired: {
      control: false,
      description: "DEPRECATED: use `required` instead",
      table: {
        category: "Deprecated",
        type: { summary: "boolean" },
      },
    },
    isDisabled: {
      control: false,
      description: "DEPRECATED: use `disabled` instead",
      table: {
        category: "Deprecated",
        type: { summary: "boolean" },
      },
    },
  },
  args: {
    label: "Choose date",
    modelValue: undefined,
    required: false,
    disabled: false,
    size: "md",
    min: undefined,
    max: undefined,
    errorMessage: "",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `
    <div class="w-64">
      <VcDateSelector v-bind="args" v-model="args.modelValue" />
    </div>
  `,
  }),
  parameters: {
    a11y: {
      // Disable target-size rule - calendar button size is determined by input height
      // Using options.rules for axe.run() to ensure the rule is disabled during execution
      options: {
        rules: {
          "target-size": { enabled: false },
        },
      },
    },
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {};

export const Disabled: StoryType = {
  args: {
    disabled: true,
  },
};

export const WithMinMax: StoryType = {
  args: (() => {
    const currentYear = new Date().getFullYear();
    const today = new Date().toISOString().split("T")[0];

    return {
      min: `${currentYear}-01-01`,
      max: `${currentYear}-12-31`,
      modelValue: today,
    };
  })(),
  storyName: "With Min/Max Constraints",
  parameters: {
    docs: {
      description: {
        story: (() => {
          const currentYear = new Date().getFullYear();
          return `Date selector with min and max constraints. Allowed range: January 1, ${currentYear} to December 31, ${currentYear}. The browser date picker will limit selection to this range.`;
        })(),
      },
    },
  },
};

export const ErrorState: StoryType = {
  args: {
    errorMessage: "Date is required",
    required: true,
  },
};

export const OutOfRangeValidation: StoryType = {
  args: (() => {
    const today = new Date();
    const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
    const currentYear = today.getFullYear();

    return {
      min: `${currentYear}-${currentMonth}-15`,
      max: `${currentYear}-${currentMonth}-20`,
      modelValue: `${currentYear}-${currentMonth}-10`, // This date is before min
    };
  })(),
  storyName: "Out of Range Validation",
  parameters: {
    docs: {
      description: {
        story: (() => {
          const today = new Date();
          const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
          const currentYear = today.getFullYear();
          return `Shows validation error when date is outside min/max range (${currentYear}-${currentMonth}-15 to ${currentYear}-${currentMonth}-20). The selected date (${currentYear}-${currentMonth}-10) is before the minimum, triggering the validation error.`;
        })(),
      },
    },
  },
};

export const WithDateTime: StoryType = {
  args: (() => {
    const today = new Date();
    const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
    const currentYear = today.getFullYear();

    return {
      min: `${currentYear}-${currentMonth}-15T10:30:00`, // Time component will be stripped
      max: `${currentYear}-${currentMonth}-20T15:45:00`, // Time component will be stripped
      modelValue: `${currentYear}-${currentMonth}-17`,
    };
  })(),
  storyName: "Min/Max with DateTime (Auto-normalized)",
  parameters: {
    docs: {
      description: {
        story:
          "If you pass DateTime values (e.g., from an API), the component automatically strips the time portion and uses only the date (YYYY-MM-DD).",
      },
    },
  },
};
