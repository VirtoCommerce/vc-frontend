import { VcInput } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["xs", "sm", "md"];
const TYPES = ["text", "password", "number"];

export default {
  title: "Components/Molecules/VcInput",
  component: VcInput,
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
} as Meta<typeof VcInput>;

const Template: StoryFn = (args) => ({
  components: { VcInput },
  setup: () => ({ args }),
  template: '<VcInput v-bind="args" v-model="args.modelValue" />',
});

const withButtonTemplate: StoryFn = (args) => ({
  components: { VcInput },
  setup: () => ({ args }),
  template: `<VcInput v-bind="args" v-model="args.modelValue">
    <template #append>
      <VcButton truncate>Add to cart</VcButton>
    </template>
  </VcInput>`,
});

export const Basic = Template.bind({});

export const Common = Template.bind({});
Common.args = {
  label: "Label",
  placeholder: "Placeholder",
  message: "Hint message",
};

export const Required = Template.bind({});
Required.args = {
  ...Common.args,
  required: true,
};

export const ErrorState = Template.bind({});
ErrorState.args = {
  ...Required.args,
  error: true,
  message: "Error message",
};

export const TypePassword = Template.bind({});
TypePassword.args = {
  ...Common.args,
  autocomplete: "password",
  type: "password",
};

export const Clearable = Template.bind({});
Clearable.args = {
  ...Common.args,
  clearable: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Common.args,
  disabled: true,
};

export const Center = Template.bind({});
Center.args = {
  ...Common.args,
  center: true,
};

export const WithButton = withButtonTemplate.bind({});
WithButton.args = {
  ...Common.args,
};
