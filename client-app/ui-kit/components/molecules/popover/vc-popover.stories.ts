import { VcPopover } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const PLACEMENTS = [
  "top",
  "top-start",
  "top-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "left-start",
  "left-end",
  "right",
  "right-start",
  "right-end",
];

const meta: Meta<typeof VcPopover> = {
  title: "Components/Molecules/VcPopover",
  component: VcPopover,
  argTypes: {
    placement: {
      control: "select",
      options: PLACEMENTS,
      description: "Preferred placement of the popover content",
    },
    disabled: {
      control: "boolean",
      description: "Prevents the popover from opening",
    },
    hover: {
      control: "boolean",
      description: "Opens the popover on hover instead of click",
    },
    arrowEnabled: {
      control: "boolean",
      description:
        "Adds a small triangular caret pointing toward the trigger. Note: the effect is subtle — the caret relies on a box-shadow that is partially clipped by the component's overflow:hidden.",
    },
    width: {
      control: "text",
      description: "Width of the popover content panel",
    },
  },
  args: {
    placement: "bottom",
    disabled: false,
    hover: false,
    arrowEnabled: false,
  },
  decorators: [
    () => ({
      template: '<div class="flex justify-center p-16"><story /></div>',
    }),
  ],
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcPopover v-bind="args">
      <template #trigger="{ triggerProps }">
        <VcButton v-bind="triggerProps">Click to open</VcButton>
      </template>
      <template #content>
        <div class="rounded bg-additional-50 p-4 shadow-md text-sm">
          Popover content
        </div>
      </template>
    </VcPopover>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcPopover>
            <template #trigger="{ triggerProps }">
              <VcButton v-bind="triggerProps">Click to open</VcButton>
            </template>
            <template #content>
              <div class="rounded bg-additional-50 p-4 shadow-md">Popover content</div>
            </template>
          </VcPopover>
        `,
      },
    },
  },
};

export const Hover: StoryType = {
  args: {
    hover: true,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcPopover v-bind="args">
      <template #trigger="{ triggerProps }">
        <VcButton v-bind="triggerProps">Hover to open</VcButton>
      </template>
      <template #content>
        <div class="rounded bg-additional-50 p-4 shadow-md text-sm">
          Popover shown on hover
        </div>
      </template>
    </VcPopover>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcPopover hover>
            <template #trigger="{ triggerProps }">
              <VcButton v-bind="triggerProps">Hover to open</VcButton>
            </template>
            <template #content>
              <div class="rounded bg-additional-50 p-4 shadow-md">Popover shown on hover</div>
            </template>
          </VcPopover>
        `,
      },
    },
  },
};

export const Disabled: StoryType = {
  args: {
    disabled: true,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcPopover v-bind="args">
      <template #trigger="{ triggerProps }">
        <VcButton disabled v-bind="triggerProps">Disabled popover</VcButton>
      </template>
      <template #content>
        <div class="rounded bg-additional-50 p-4 shadow-md text-sm">
          This will never show
        </div>
      </template>
    </VcPopover>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcPopover disabled>
            <template #trigger="{ triggerProps }">
              <VcButton disabled v-bind="triggerProps">Disabled popover</VcButton>
            </template>
            <template #content>
              <div class="rounded bg-additional-50 p-4 shadow-md">This will never show</div>
            </template>
          </VcPopover>
        `,
      },
    },
  },
};

export const Dialog: StoryType = {
  args: {
    role: "dialog",
    ariaLabel: "Filters",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcPopover v-bind="args">
      <template #trigger="{ triggerProps }">
        <VcButton v-bind="triggerProps">Open filters</VcButton>
      </template>
      <template #content="{ close }">
        <div class="rounded bg-additional-50 p-4 shadow-md text-sm space-y-3">
          <p>Press Escape here — the panel closes and focus goes back to the trigger.</p>
          <VcButton size="sm" @click="close">Apply</VcButton>
        </div>
      </template>
    </VcPopover>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`role="dialog"` opts the panel into the non-modal dialog contract: it is named by `ariaLabel`, takes focus when it opens, closes on Escape from anywhere inside, and hands focus back to the trigger on close. The page stays interactive, so no `aria-modal` and no focus trap.',
      },
      source: {
        code: `
          <VcPopover role="dialog" aria-label="Filters">
            <template #trigger="{ triggerProps }">
              <VcButton v-bind="triggerProps">Open filters</VcButton>
            </template>
            <template #content="{ close }">
              <div class="rounded bg-additional-50 p-4 shadow-md">
                <VcButton size="sm" @click="close">Apply</VcButton>
              </div>
            </template>
          </VcPopover>
        `,
      },
    },
  },
};

export const TopPlacement: StoryType = {
  args: {
    placement: "top",
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcPopover v-bind="args">
      <template #trigger="{ triggerProps }">
        <VcButton v-bind="triggerProps">Opens above</VcButton>
      </template>
      <template #content>
        <div class="rounded bg-additional-50 p-4 shadow-md text-sm">
          Top placement
        </div>
      </template>
    </VcPopover>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcPopover placement="top">
            <template #trigger="{ triggerProps }">
              <VcButton v-bind="triggerProps">Opens above</VcButton>
            </template>
            <template #content>
              <div class="rounded bg-additional-50 p-4 shadow-md">Top placement</div>
            </template>
          </VcPopover>
        `,
      },
    },
  },
};
