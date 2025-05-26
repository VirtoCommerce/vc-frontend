import { VcSelect } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["xs", "sm", "md"];
const ITEM_SIZES = ["xs", "sm", "md", "lg"];

export default {
  title: "Components/Molecules/VcSelect",
  component: VcSelect,
  argTypes: {
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
    itemSize: {
      control: "radio",
      options: ITEM_SIZES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: ITEM_SIZES.join(" | "),
        },
      },
    },
    modelValue: { table: { type: { summary: "object|string|array" } } },
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

const Template: StoryFn = (args) => ({
  components: { VcSelect },
  setup: () => ({ args }),
  template: `<VcSelect v-bind="args" v-model="args.modelValue" class="mb-32" />`,
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
  required: true,
};

export const Readonly = Template.bind({});
Readonly.args = {
  ...Common.args,
  readonly: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Common.args,
  disabled: true,
};

export const Clearable = Template.bind({});
Clearable.args = {
  ...Common.args,
  clearable: true,
};

export const ErrorState = Template.bind({});
ErrorState.args = {
  ...Required.args,
  error: true,
  message: "Error message",
};

export const Autocomplete = Template.bind({});
Autocomplete.args = {
  ...Required.args,
  placeholder: "Search item",
  autocomplete: true,
};

export const MultipleSelect = Template.bind({});
MultipleSelect.args = {
  ...Required.args,
  modelValue: [],
  placeholder: "Select multiple items",
  multiple: true,
};

export const MultipleSelectAutocomplete = Template.bind({});
MultipleSelectAutocomplete.args = {
  ...MultipleSelect.args,
  autocomplete: true,
};

export const MultipleSelectAutocompleteClearable = Template.bind({});
MultipleSelectAutocompleteClearable.args = {
  ...MultipleSelectAutocomplete.args,
  clearable: true,
};

export const Custom: StoryFn = (args) => ({
  components: { VcSelect },
  setup: () => ({ args }),
  template: `<VcSelect v-bind="args" v-model="args.modelValue" class="mb-32">
    <template #placeholder>
      <div class="flex items-center gap-3 p-3 text-sm">
        <div class="w-8 h-8 rounded-full bg-neutral-200"></div>
        Select an item
      </div>
    </template>

    <template #selected="{ item }">
      <div class="flex items-center gap-3 p-3 text-sm">
        <div class="flex items-center justify-center w-8 h-8 rounded-full text-additional-50 bg-danger">{{ item[0] }}</div>

        {{ item }}
      </div>
    </template>

    <template #item="{ item }">
      <div class="flex items-center justify-center w-8 h-8 rounded-full text-additional-50 bg-info">{{ item[0] }}</div>

      {{ item }}
    </template>
  </VcSelect>`,
});
Custom.args = {
  items: ["Albania", "Belgium", "China", "India"],
};
