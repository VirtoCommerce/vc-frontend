import { VcCheckbox, VcIcon, VcTooltip } from "..";
import { VcButton, VcDropdownMenu, VcMenuItem } from "../../molecules";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];
const LABEL = ["left", "right"];

export default {
  title: "Components/Atoms/VcCheckbox",
  component: VcCheckbox,
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
      options: LABEL,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: LABEL.join(" | "),
        },
      },
    },
  },
} as Meta<typeof VcCheckbox>;

type StoryType = StoryObj<typeof VcCheckbox>;

export const Basic: StoryType = {
  args: {
    ariaLabel: "Basic checkbox",
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcCheckbox aria-label="Basic checkbox" />
        `,
      },
    },
  },
};

export const Checked: StoryType = {
  args: {
    modelValue: true,
    ariaLabel: "Checked checkbox",
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcCheckbox :model-value="true" aria-label="Checked checkbox" />
        `,
      },
    },
  },
};

export const Indeterminate: StoryType = {
  args: {
    indeterminate: true,
    ariaLabel: "Indeterminate checkbox",
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcCheckbox indeterminate aria-label="Indeterminate checkbox" />
        `,
      },
    },
  },
};

export const Label: StoryType = {
  render: (args) => ({
    components: { VcCheckbox },
    setup: () => ({ args }),
    template: '<VcCheckbox v-bind="args">VcCheckbox Label</VcCheckbox>',
  }),
  parameters: {
    docs: {
      source: {
        code: `
<VcCheckbox>VcCheckbox Label</VcCheckbox>
        `,
      },
    },
  },
};

export const LabelWithInteractiveContent: StoryType = {
  render: (args) => ({
    components: { VcCheckbox },
    setup: () => ({ args }),
    template: `<div class="space-y-4">
      <VcCheckbox v-bind="args">
        I agree to the
        <a href="#" class="ms-1 underline">Terms and Conditions</a>
      </VcCheckbox>

      <VcCheckbox v-bind="args">
        Ship to my default address
        <button type="button" class="ms-2 rounded-[--vc-radius] border border-neutral-300 px-1.5 text-xs leading-4">Change</button>
      </VcCheckbox>
    </div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Interactive content in the label slot — links with `href`, buttons, selects — receives its own clicks and does not toggle the checkbox. Elements that only look interactive (`role="button"` on a `div`) are not exempt from label activation and will do both; use a real interactive element.',
      },
      source: {
        code: `
<VcCheckbox>
  I agree to the
  <a href="#" class="ms-1 underline">Terms and Conditions</a>
</VcCheckbox>

<VcCheckbox>
  Ship to my default address
  <button type="button" class="ms-2 rounded-[--vc-radius] border border-neutral-300 px-1.5 text-xs leading-4">Change</button>
</VcCheckbox>
        `,
      },
    },
  },
};

export const Tooltip: StoryType = {
  render: (args) => ({
    components: { VcCheckbox, VcTooltip, VcIcon },
    setup: () => ({ args }),
    template: `<div class="space-y-4">
      <VcCheckbox v-bind="args">
        Show in stock

        <template #tooltip>Only products available to ship right now</template>
      </VcCheckbox>

      <VcCheckbox v-bind="args">
        Show in stock

        <VcTooltip>
          <template #trigger>
            <VcIcon class="ms-1 block" name="information-circle" size="xs" />
          </template>

          <template #content>Only products available to ship right now</template>
        </VcTooltip>
      </VcCheckbox>
    </div>

    <div class="h-32"></div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Two ways to explain a checkbox. The `tooltip` slot puts one tooltip on the whole control, opening on hover over the label; the `tooltip` prop sets its placement and width. Alternatively put your own `VcTooltip` in the label slot when only part of the label should explain itself — its trigger is not interactive content, so clicking the icon still toggles the checkbox.",
      },
      source: {
        code: `
<VcCheckbox>
  Show in stock

  <template #tooltip>Only products available to ship right now</template>
</VcCheckbox>

<VcCheckbox>
  Show in stock

  <VcTooltip>
    <template #trigger>
      <VcIcon class="ms-1 block" name="information-circle" size="xs" />
    </template>

    <template #content>Only products available to ship right now</template>
  </VcTooltip>
</VcCheckbox>
        `,
      },
    },
  },
};

export const LabelPositionLeft: StoryType = {
  render: (args) => ({
    components: { VcCheckbox },
    setup: () => ({ args }),
    template: '<VcCheckbox v-bind="args">Checkbox Label</VcCheckbox>',
  }),
  args: {
    labelPosition: "left",
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcCheckbox label-position="left">Checkbox Label</VcCheckbox>
        `,
      },
    },
  },
};

export const BasicDisabled: StoryType = {
  args: {
    disabled: true,
    ariaLabel: "Disabled checkbox",
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcCheckbox disabled aria-label="Disabled checkbox" />
        `,
      },
    },
  },
};

export const CheckedDisabled: StoryType = {
  args: {
    disabled: true,
    modelValue: true,
    ariaLabel: "Checked disabled checkbox",
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcCheckbox disabled :model-value="true" aria-label="Checked disabled checkbox" />
        `,
      },
    },
  },
};

export const IndeterminateDisabled: StoryType = {
  args: {
    disabled: true,
    indeterminate: true,
    ariaLabel: "Indeterminate disabled checkbox",
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcCheckbox disabled indeterminate aria-label="Indeterminate disabled checkbox" />
        `,
      },
    },
  },
};

export const Message: StoryType = {
  render: (args) => ({
    components: { VcCheckbox },
    setup: () => ({ args }),
    template: '<VcCheckbox v-bind="args">VcCheckbox Label</VcCheckbox>',
  }),
  args: {
    message: "Some smart message",
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcCheckbox message="Some smart message">VcCheckbox Label</VcCheckbox>
        `,
      },
    },
  },
};

export const ErrorMessage: StoryType = {
  render: (args) => ({
    components: { VcCheckbox },
    setup: () => ({ args }),
    template: '<VcCheckbox v-bind="args">Checkbox Label</VcCheckbox>',
  }),
  args: {
    error: true,
    message: "Error message",
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcCheckbox error message="Error message">Checkbox Label</VcCheckbox>
        `,
      },
    },
  },
};

export const AllSizes: StoryType = {
  render: () => ({
    components: { VcCheckbox },
    setup: () => ({ sizes: SIZES }),
    template: `<div class="space-y-4">
      <div v-for="size in sizes" :key="size" class="flex items-center gap-4">
        <span class="w-8 text-sm font-medium">{{ size }}</span>
        <VcCheckbox :size="size" :model-value="true">Checkbox label</VcCheckbox>
      </div>
    </div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
<VcCheckbox size="xs" :model-value="true">Checkbox label</VcCheckbox>
<VcCheckbox size="sm" :model-value="true">Checkbox label</VcCheckbox>
<VcCheckbox size="md" :model-value="true">Checkbox label</VcCheckbox>
        `,
      },
    },
  },
};

export const CustomColor: StoryType = {
  render: (args) => ({
    components: { VcCheckbox },
    setup: () => ({ args }),
    template: '<VcCheckbox v-bind="args" class="[--vc-checkbox-base-color:red]">VcCheckbox Label</VcCheckbox>',
  }),
  args: {
    modelValue: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<VcCheckbox :model-value="true" class="[--vc-checkbox-base-color:red]">VcCheckbox Label</VcCheckbox>
        `,
      },
    },
  },
};

export const InsideMenuItem: StoryType = {
  render: (args) => ({
    components: { VcCheckbox, VcButton, VcDropdownMenu, VcMenuItem },
    setup: () => ({ args }),
    template: `<VcDropdownMenu v-bind="args">
      <template #trigger="{ triggerProps }">
        <VcButton v-bind="triggerProps">Open menu</VcButton>
      </template>

      <template #content>
        <VcMenuItem>
          <VcCheckbox :model-value="true">Option 1</VcCheckbox>
        </VcMenuItem>
        <VcMenuItem>
          <VcCheckbox>Option 2</VcCheckbox>
        </VcMenuItem>
        <VcMenuItem>
          <VcCheckbox :model-value="true">Option 3</VcCheckbox>
        </VcMenuItem>
        <VcMenuItem>
          <VcCheckbox>Option 4</VcCheckbox>
        </VcMenuItem>
      </template>
    </VcDropdownMenu>

    <div class="h-52"></div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
<VcDropdownMenu>
  <template #trigger="{ triggerProps }">
    <VcButton v-bind="triggerProps">Open menu</VcButton>
  </template>

  <template #content>
    <VcMenuItem>
      <VcCheckbox :model-value="true">Option 1</VcCheckbox>
    </VcMenuItem>
    <VcMenuItem>
      <VcCheckbox>Option 2</VcCheckbox>
    </VcMenuItem>
  </template>
</VcDropdownMenu>
        `,
      },
    },
  },
};
