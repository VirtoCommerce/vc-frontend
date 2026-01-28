import { VcInput, VcButton } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];
const TYPES = ["text", "password", "number"];

const meta: Meta = {
  title: "Components/Molecules/VcInput",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: VcInput as any,
  argTypes: {
    /**
     * Docs:
     *  https://storybook.js.org/docs/vue/essentials/controls#annotation
     *  https://storybook.js.org/docs/vue/api/argtypes#manual-specification
     */
    type: {
      control: "radio",
      options: TYPES,
      table: { type: { summary: TYPES.join(" | ") } },
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
    min: { table: { type: { summary: "string|number" } } },
    max: { table: { type: { summary: "string|number" } } },
    step: { table: { type: { summary: "string|number" } } },
    minlength: { table: { type: { summary: "string|number" } } },
    maxlength: { table: { type: { summary: "string|number" } } },
    modelValue: { table: { type: { summary: "string|number" } } },
  },
  args: {
    readonly: false,
    disabled: false,
    required: false,
    noBorder: false,
    center: false,
    hidePasswordSwitcher: false,
    error: false,
    showEmptyDetails: false,
    type: "text",
    size: "md",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcInput v-bind="args" v-model="args.modelValue" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const commonArgs = {
  label: "Label",
  placeholder: "Placeholder",
  message: "Hint message",
};

export const Basic: StoryType = {
  args: {
    ariaLabel: "Input field",
  },
};

export const Common: StoryType = {
  args: commonArgs,
};

export const Required: StoryType = {
  args: {
    ...commonArgs,
    required: true,
  },
};

export const ErrorState: StoryType = {
  args: {
    ...commonArgs,
    required: true,
    error: true,
    message: "Error message",
  },
};

export const TypePassword: StoryType = {
  args: {
    ...commonArgs,
    autocomplete: "password",
    type: "password",
  },
};

export const Clearable: StoryType = {
  args: {
    ...commonArgs,
    clearable: true,
  },
};

export const Disabled: StoryType = {
  args: {
    ...commonArgs,
    disabled: true,
  },
};

export const Center: StoryType = {
  args: {
    ...commonArgs,
    center: true,
  },
};

export const WithButton: StoryType = {
  args: commonArgs,
  render: (args) => ({
    components: { VcInput, VcButton },
    setup: () => ({ args }),
    template: `<VcInput v-bind="args" v-model="args.modelValue">
      <template #append>
        <VcButton truncate>Add to cart</VcButton>
      </template>
    </VcInput>`,
  }),
};
