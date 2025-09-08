import { VcDateSelector } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["xs", "sm", "md", "auto"];

export default {
  title: "Components/Atoms/VcDateSelector",
  component: VcDateSelector,
  argTypes: {
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
    // deprecated props (kept for documentation)
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
    min: {
      control: "date",
      table: { type: { summary: "string" } },
    },
    max: {
      control: "date",
      table: { type: { summary: "string" } },
    },
    errorMessage: {
      control: "text",
      table: { type: { summary: "string" } },
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
} as Meta<typeof VcDateSelector>;

const Template: StoryFn = (args) => ({
  components: { VcDateSelector },
  setup: () => ({ args }),
  template: `
    <div class="w-64">
      <VcDateSelector v-bind="args" />
    </div>
  `,
});

export const Basic = Template.bind({});

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const WithMinMax = Template.bind({});
WithMinMax.args = {
  min: "2025-09-01",
  max: "2025-09-20",
};

export const ErrorState = Template.bind({});
ErrorState.args = {
  errorMessage: "Date is required",
  required: true,
};
