import { VcSelect } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];
const ITEM_SIZES = ["xs", "sm", "md", "lg"];

const meta: Meta<typeof VcSelect> = {
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
    size: "md",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcSelect v-bind="args" v-model="args.modelValue" class="mb-32" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    items: ["Albania", "Belgium", "China", "India"],
    label: "Country",
  },
};

export const Common: StoryType = {
  args: {
    items: ["Albania", "Belgium", "China", "India"],
    label: "Label",
    placeholder: "Placeholder",
    message: "Hint message",
  },
};

export const Required: StoryType = {
  args: {
    ...Common.args,
    required: true,
  },
};

export const Readonly: StoryType = {
  args: {
    ...Common.args,
    readonly: true,
  },
};

export const Disabled: StoryType = {
  args: {
    ...Common.args,
    disabled: true,
  },
};

export const Clearable: StoryType = {
  args: {
    ...Common.args,
    clearable: true,
  },
};

export const ErrorState: StoryType = {
  args: {
    ...Common.args,
    message: "Error message",
    required: true,
    error: true,
  },
};

export const Autocomplete: StoryType = {
  args: {
    ...Common.args,
    placeholder: "Search item",
    required: true,
    autocomplete: true,
  },
};

export const MultipleSelect: StoryType = {
  args: {
    ...Common.args,
    placeholder: "Select multiple items",
    required: true,
    modelValue: [],
    multiple: true,
  },
};

export const MultipleSelectAutocomplete: StoryType = {
  args: {
    ...Common.args,
    placeholder: "Select multiple items",
    required: true,
    modelValue: [],
    multiple: true,
    autocomplete: true,
  },
};

export const MultipleSelectAutocompleteClearable: StoryType = {
  args: {
    ...Common.args,
    placeholder: "Select multiple items",
    required: true,
    modelValue: [],
    multiple: true,
    autocomplete: true,
    clearable: true,
  },
};

export const Custom: StoryType = {
  args: {
    items: ["Albania", "Belgium", "China", "India"],
  },
  render: (args) => ({
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
  }),
};
