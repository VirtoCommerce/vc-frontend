import { VcSelect } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];
const ITEM_SIZES = ["xs", "sm", "md", "lg"];

const ITEMS = ["Albania", "Belgium", "China", "India"];

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
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: "label", enabled: true },
          { id: "autocomplete-valid", enabled: true },
          { id: "target-size", enabled: false },
        ],
      },
      options: {
        rules: {
          // aria-controls references the listbox <ul> which always exists in the DOM
          // (VcPopover renders content eagerly with display:none when closed).
          // When the dropdown is open, aria-controls is set and the listbox is visible.
          // When closed, aria-controls is removed (set to undefined).
          // axe marks this "Inconclusive" because it cannot dynamically verify the
          // referenced ID at scan time — this is a false positive.
          // Using options.rules (axe.run() API) instead of config.rules (axe.configure())
          // to properly suppress "incomplete" results.
          "aria-valid-attr-value": { enabled: false },
        },
      },
    },
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
    items: ITEMS,
    label: "Country",
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcSelect v-model="selected" :items="['Albania', 'Belgium', 'China', 'India']" label="Country" />
        `,
      },
    },
  },
};

export const Common: StoryType = {
  args: {
    items: ITEMS,
    label: "Label",
    placeholder: "Placeholder",
    message: "Hint message",
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcSelect
  v-model="selected"
  :items="['Albania', 'Belgium', 'China', 'India']"
  label="Label"
  placeholder="Placeholder"
  message="Hint message"
/>
        `,
      },
    },
  },
};

export const Required: StoryType = {
  args: {
    ...Common.args,
    required: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcSelect
  v-model="selected"
  :items="['Albania', 'Belgium', 'China', 'India']"
  label="Label"
  placeholder="Placeholder"
  message="Hint message"
  required
/>
        `,
      },
    },
  },
};

export const Readonly: StoryType = {
  args: {
    ...Common.args,
    readonly: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcSelect
  v-model="selected"
  :items="['Albania', 'Belgium', 'China', 'India']"
  label="Label"
  placeholder="Placeholder"
  message="Hint message"
  readonly
/>
        `,
      },
    },
  },
};

export const Disabled: StoryType = {
  args: {
    ...Common.args,
    disabled: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcSelect
  v-model="selected"
  :items="['Albania', 'Belgium', 'China', 'India']"
  label="Label"
  placeholder="Placeholder"
  message="Hint message"
  disabled
/>
        `,
      },
    },
  },
};

export const Clearable: StoryType = {
  args: {
    ...Common.args,
    clearable: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcSelect
  v-model="selected"
  :items="['Albania', 'Belgium', 'China', 'India']"
  label="Label"
  placeholder="Placeholder"
  message="Hint message"
  clearable
/>
        `,
      },
    },
  },
};

export const ErrorState: StoryType = {
  args: {
    ...Common.args,
    message: "Error message",
    required: true,
    error: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcSelect
  v-model="selected"
  :items="['Albania', 'Belgium', 'China', 'India']"
  label="Label"
  placeholder="Placeholder"
  message="Error message"
  required
  error
/>
        `,
      },
    },
  },
};

export const Autocomplete: StoryType = {
  args: {
    ...Common.args,
    placeholder: "Search item",
    required: true,
    autocomplete: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcSelect
  v-model="selected"
  :items="['Albania', 'Belgium', 'China', 'India']"
  label="Label"
  placeholder="Search item"
  message="Hint message"
  required
  autocomplete
/>
        `,
      },
    },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcSelect
  v-model="selected"
  :items="['Albania', 'Belgium', 'China', 'India']"
  label="Label"
  placeholder="Select multiple items"
  message="Hint message"
  required
  multiple
/>
        `,
      },
    },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcSelect
  v-model="selected"
  :items="['Albania', 'Belgium', 'China', 'India']"
  label="Label"
  placeholder="Select multiple items"
  message="Hint message"
  required
  multiple
  autocomplete
/>
        `,
      },
    },
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
  parameters: {
    docs: {
      source: {
        code: `
<VcSelect
  v-model="selected"
  :items="['Albania', 'Belgium', 'China', 'India']"
  label="Label"
  placeholder="Select multiple items"
  message="Hint message"
  required
  multiple
  autocomplete
  clearable
/>
        `,
      },
    },
  },
};

export const SizeVariants: StoryType = {
  render: (args) => ({
    setup: () => ({ args }),
    template: `<div class="flex flex-col gap-4 mb-32">
    <VcSelect v-bind="args" v-model="args.modelValue" size="xs" label="Extra Small (xs)" />
    <VcSelect v-bind="args" v-model="args.modelValue" size="sm" label="Small (sm)" />
    <VcSelect v-bind="args" v-model="args.modelValue" size="md" label="Medium (md)" />
  </div>`,
  }),
  args: {
    items: ITEMS,
    placeholder: "Select a country",
  },
  parameters: {
    docs: {
      source: {
        code: `
<div class="flex flex-col gap-4">
  <VcSelect v-model="selected" :items="['Albania', 'Belgium', 'China', 'India']" size="xs" label="Extra Small (xs)" placeholder="Select a country" />
  <VcSelect v-model="selected" :items="['Albania', 'Belgium', 'China', 'India']" size="sm" label="Small (sm)" placeholder="Select a country" />
  <VcSelect v-model="selected" :items="['Albania', 'Belgium', 'China', 'India']" size="md" label="Medium (md)" placeholder="Select a country" />
</div>
        `,
      },
    },
  },
};

export const WithoutLabel: StoryType = {
  args: {
    items: ITEMS,
    placeholder: "Select a country",
    ariaLabel: "Country",
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcSelect
  v-model="selected"
  :items="['Albania', 'Belgium', 'China', 'India']"
  placeholder="Select a country"
  aria-label="Country"
/>
        `,
      },
    },
  },
};

export const EmptyItems: StoryType = {
  args: {
    items: [],
    label: "Country",
    placeholder: "No options available",
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcSelect v-model="selected" :items="[]" label="Country" placeholder="No options available" />
        `,
      },
    },
  },
};

export const Custom: StoryType = {
  args: {
    items: ITEMS,
    ariaLabel: "Select an item",
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
  parameters: {
    docs: {
      source: {
        code: `
<VcSelect v-model="selected" :items="['Albania', 'Belgium', 'China', 'India']" aria-label="Select an item">
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
</VcSelect>
        `,
      },
    },
  },
};
