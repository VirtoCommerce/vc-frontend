import { ref } from "vue";
import { VcButton, VcDropdownMenu, VcMenuItem } from "@/ui-kit/components/molecules";
import { VcRadioButton } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];
const LABEL_POSITIONS = ["left", "right"];

export default {
  title: "Components/Atoms/VcRadioButton",
  component: VcRadioButton,
  argTypes: {
    size: {
      control: "inline-radio",
      options: SIZES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: SIZES.join(" | "),
        },
      },
    },
    labelPosition: {
      control: "inline-radio",
      options: LABEL_POSITIONS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: LABEL_POSITIONS.join(" | "),
        },
      },
    },
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
    },
  },
  render: (args) => ({
    components: { VcRadioButton },
    setup: () => ({ args }),
    template: '<VcRadioButton v-bind="args" v-model="args.modelValue" />',
  }),
} as Meta<typeof VcRadioButton>;

type StoryType = StoryObj<typeof VcRadioButton>;

export const Basic: StoryType = {
  args: {
    value: "value",
    ariaLabel: "Basic radio button",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcRadioButton value="value" aria-label="Basic radio button" />
        `,
      },
    },
  },
};

export const Checked: StoryType = {
  args: {
    value: "value",
    modelValue: "value",
    ariaLabel: "Checked radio button",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcRadioButton v-model="selected" value="value" aria-label="Checked radio button" />
        `,
      },
    },
  },
};

export const WithLabel: StoryType = {
  args: {
    value: "value",
    label: "RadioButton Label",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcRadioButton value="value" label="RadioButton Label" />
        `,
      },
    },
  },
};

export const LabelPositionLeft: StoryType = {
  args: {
    value: "value",
    label: "RadioButton Label",
    labelPosition: "left",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcRadioButton value="value" label="RadioButton Label" label-position="left" />
        `,
      },
    },
  },
};

export const WithSlot: StoryType = {
  render: (args) => ({
    components: { VcRadioButton },
    setup: () => ({ args }),
    template: '<VcRadioButton v-bind="args" v-model="args.modelValue">Label from slot</VcRadioButton>',
  }),
  args: {
    value: "value",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcRadioButton value="value">Label from slot</VcRadioButton>
        `,
      },
    },
  },
};

export const BreakWord: StoryType = {
  decorators: [
    () => ({
      template: '<div class="w-40"><story /></div>',
    }),
  ],
  args: {
    value: "value",
    label: "RadioButtonLabelLongValueWithoutSpaces",
    wordBreak: "break-word",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcRadioButton value="value" label="RadioButtonLabelLongValueWithoutSpaces" word-break="break-word" />
        `,
      },
    },
  },
};

export const MaxLines: StoryType = {
  decorators: [
    () => ({
      template: '<div class="w-40"><story /></div>',
    }),
  ],
  args: {
    value: "value",
    label: "Radio Button Label With Very Long Value",
    wordBreak: "break-word",
    maxLines: 2,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcRadioButton value="value" label="Radio Button Label With Very Long Value" word-break="break-word" :max-lines="2" />
        `,
      },
    },
  },
};

export const Disabled: StoryType = {
  args: {
    value: "value",
    label: "RadioButton Label",
    disabled: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcRadioButton value="value" label="RadioButton Label" disabled />
        `,
      },
    },
  },
};

export const DisabledChecked: StoryType = {
  args: {
    value: "value",
    modelValue: "value",
    label: "RadioButton Label",
    disabled: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcRadioButton v-model="selected" value="value" label="RadioButton Label" disabled />
        `,
      },
    },
  },
};

export const Message: StoryType = {
  args: {
    value: "value",
    label: "RadioButton Label",
    message: "Information message",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcRadioButton value="value" label="RadioButton Label" message="Information message" />
        `,
      },
    },
  },
};

export const ErrorMessage: StoryType = {
  args: {
    value: "value",
    label: "RadioButton Label",
    message: "Error message",
    error: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcRadioButton value="value" label="RadioButton Label" message="Error message" error />
        `,
      },
    },
  },
};

export const AllSizes: StoryType = {
  render: () => ({
    components: { VcRadioButton },
    setup: () => ({ sizes: SIZES }),
    template: `<div class="space-y-4">
      <div v-for="size in sizes" :key="size" class="flex items-center gap-4">
        <span class="w-8 text-sm font-medium">{{ size }}</span>
        <VcRadioButton :size="size" value="option" label="Radio button label" />
      </div>
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcRadioButton size="xs" value="option" label="Radio button label" />
          <VcRadioButton size="sm" value="option" label="Radio button label" />
          <VcRadioButton size="md" value="option" label="Radio button label" />
        `,
      },
    },
  },
};

export const RadioGroup: StoryType = {
  render: (args) => ({
    components: { VcRadioButton },
    setup: () => {
      const selected = ref(args.modelValue);
      return { args, selected };
    },
    template: `<div class="space-y-2">
      <VcRadioButton v-model="selected" name="group" value="option1" label="Option 1" />
      <VcRadioButton v-model="selected" name="group" value="option2" label="Option 2" />
      <VcRadioButton v-model="selected" name="group" value="option3" label="Option 3" />
    </div>`,
  }),
  args: {
    modelValue: "option1",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcRadioButton v-model="selected" name="group" value="option1" label="Option 1" />
          <VcRadioButton v-model="selected" name="group" value="option2" label="Option 2" />
          <VcRadioButton v-model="selected" name="group" value="option3" label="Option 3" />
        `,
      },
    },
  },
};

export const InsideMenuItem: StoryType = {
  render: (args) => ({
    components: { VcRadioButton, VcButton, VcDropdownMenu, VcMenuItem },
    setup: () => {
      const selected = ref(args.modelValue);
      const sortingOptions = [
        { id: "name-asc", name: "Name: A to Z" },
        { id: "name-desc", name: "Name: Z to A" },
        { id: "price-asc", name: "Price: Low to High" },
        { id: "price-desc", name: "Price: High to Low" },
      ];

      function selectOption(id: string, close: () => void) {
        selected.value = id;
        close();
      }

      return { args, selected, sortingOptions, selectOption };
    },
    template: `<VcDropdownMenu max-height="20rem" width="15rem">
      <template #trigger="{ triggerProps }">
        <VcButton size="sm" variant="outline" v-bind="triggerProps">
          Sort by
        </VcButton>
      </template>

      <template #content="{ close }">
        <VcMenuItem
          v-for="option in sortingOptions"
          :key="option.id"
          color="secondary"
          size="sm"
          @click="selectOption(option.id, close)"
        >
          <VcRadioButton
            v-model="selected"
            size="sm"
            :value="option.id"
            :label="option.name"
          />
        </VcMenuItem>
      </template>
    </VcDropdownMenu>

    <div class="h-52"></div>`,
  }),
  args: {
    modelValue: "name-asc",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcDropdownMenu max-height="20rem" width="15rem">
            <template #trigger="{ triggerProps }">
              <VcButton size="sm" variant="outline" v-bind="triggerProps">
                Sort by
              </VcButton>
            </template>

            <template #content="{ close }">
              <VcMenuItem color="secondary" size="sm" @click="selectOption(option.id, close)">
                <VcRadioButton v-model="selected" size="sm" :value="option.id" :label="option.name" />
              </VcMenuItem>
            </template>
          </VcDropdownMenu>
        `,
      },
    },
  },
};

export const CustomColor: StoryType = {
  render: (args) => ({
    components: { VcRadioButton },
    setup: () => ({ args }),
    template: '<VcRadioButton v-bind="args" class="[--vc-radio-button-base-color:red]" />',
  }),
  args: {
    value: "value",
    modelValue: "value",
    label: "Custom color radio button",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcRadioButton
            v-model="selected"
            value="value"
            label="Custom color radio button"
            class="[--vc-radio-button-base-color:red]"
          />
        `,
      },
    },
  },
};
