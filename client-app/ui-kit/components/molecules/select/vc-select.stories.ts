import { VcSelect } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcSelect",
  component: VcSelect,
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md"],
      type: { name: "string", required: false },
      table: {
        type: {
          summary: '"sm" | "md"',
        },
      },
    },
    modelValue: { table: { type: { summary: "object|string" } } },
  },
  args: {
    readonly: false,
    disabled: false,
    required: false,
    error: false,
    showEmptyDetails: false,
    type: "text",
    size: "md",
  },
} as Meta<typeof VcSelect>;

const Template: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect },
  setup: () => ({ args }),
  template: '<VcSelect v-bind="args" class="mb-32" />',
});

export const Basic = Template.bind({});
Basic.args = {
  items: ["Albania", "Belgium", "China", "India"],
};

export const Common = Template.bind({});
Common.args = {
  ...Basic.args,
  label: "Label",
  placeholder: "Placeholder",
  message: "Hint message",
};

export const Required = Template.bind({});
Required.args = {
  ...Common.args,
  modelValue: "Belgium",
  required: true,
};

export const Readonly = Template.bind({});
Readonly.args = {
  ...Common.args,
  modelValue: "Belgium",
  readonly: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Common.args,
  modelValue: "Belgium",
  disabled: true,
};

export const ErrorState = Template.bind({});
ErrorState.args = {
  ...Required.args,
  modelValue: "Belgium",
  error: true,
  message: "Error message",
};

export const Autocomplete = Template.bind({});
Autocomplete.args = {
  ...Required.args,
  modelValue: "",
  placeholder: "Search item",
  autocomplete: true,
};

export const MultipleSelect = Template.bind({});
MultipleSelect.args = {
  ...Required.args,
  modelValue: ["Belgium", "India"],
  placeholder: "Select multiple",
  multiple: true,
};
