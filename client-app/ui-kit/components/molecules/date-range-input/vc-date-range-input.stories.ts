import { ref } from "vue";
import VcDateRangeInput from "./vc-date-range-input.vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["sm", "md"];

const meta: Meta<typeof VcDateRangeInput> = {
  title: "Components/Molecules/VcDateRangeInput",
  component: VcDateRangeInput,
  parameters: {
    docs: {
      description: {
        component:
          "Two `VcDateInput` segments (start/end) inside one bordered shell that reads as a single field. The shell owns border/background/height/focus-ring/error/disabled chrome and the single details row; validity combines both segments' format validity with `start <= end` ordering.",
      },
    },
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: SIZES,
      type: { name: "string", required: false },
      table: { type: { summary: SIZES.join(" | ") } },
    },
    label: { control: "text" },
    startLabel: { control: "text" },
    endLabel: { control: "text" },
    startPlaceholder: { control: "text" },
    endPlaceholder: { control: "text" },
    message: { control: "text" },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
    required: { control: "boolean" },
    clearable: { control: "boolean" },
    error: { control: "boolean" },
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Default: StoryType = {
  args: { label: "Order date range" },
  parameters: {
    docs: {
      source: {
        code: `<VcDateRangeInput v-model="value" label="Order date range" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangeInput },
    setup() {
      const value = ref<VcDateRangeType | undefined>(undefined);
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDateRangeInput v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">Range: {{ value ?? "(none)" }}</div>
      </div>
    `,
  }),
};

export const WithValue: StoryType = {
  args: { label: "Order date range" },
  parameters: {
    docs: {
      source: {
        code: `
          <!-- value ref starts at { start: "2026-10-08", end: "2026-10-14" } -->
          <VcDateRangeInput v-model="value" label="Order date range" />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangeInput },
    setup() {
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDateRangeInput v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">Range: {{ value ?? "(none)" }}</div>
      </div>
    `,
  }),
};

export const Small: StoryType = {
  args: { label: "Order date range", size: "sm" },
  parameters: {
    docs: {
      source: {
        code: `<VcDateRangeInput v-model="value" label="Order date range" size="sm" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangeInput },
    setup() {
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
      return { args, value };
    },
    template: `<VcDateRangeInput v-bind="args" v-model="value" />`,
  }),
};

export const Disabled: StoryType = {
  args: { label: "Order date range", disabled: true },
  parameters: {
    docs: {
      source: {
        code: `<VcDateRangeInput v-model="value" label="Order date range" disabled />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangeInput },
    setup() {
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
      return { args, value };
    },
    template: `<VcDateRangeInput v-bind="args" v-model="value" />`,
  }),
};

export const ErrorState: StoryType = {
  args: { label: "Order date range", error: true, message: "End date must be after the start date" },
  parameters: {
    docs: {
      description: {
        story: "Single error row for the whole shell — segments never render their own.",
      },
      source: {
        code: `
          <VcDateRangeInput
            v-model="value"
            label="Order date range"
            :error="true"
            message="End date must be after the start date"
          />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangeInput },
    setup() {
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-20", end: "2026-10-01" });
      return { args, value };
    },
    template: `<VcDateRangeInput v-bind="args" v-model="value" />`,
  }),
};

export const Clearable: StoryType = {
  args: { label: "Order date range", clearable: true },
  parameters: {
    docs: {
      description: {
        story: "A single shell-level clear button resets both segments at once.",
      },
      source: {
        code: `<VcDateRangeInput v-model="value" label="Order date range" clearable />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangeInput },
    setup() {
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDateRangeInput v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">Range: {{ value ?? "(none)" }}</div>
      </div>
    `,
  }),
};

export const ClearableDisabled: StoryType = {
  args: { label: "Order date range", clearable: true, disabled: true },
  parameters: {
    docs: {
      description: {
        story:
          "Matches VcInput's own idiom: the clear button is hidden entirely (not just disabled) when the field is disabled or readonly.",
      },
      source: {
        code: `<VcDateRangeInput v-model="value" label="Order date range" clearable disabled />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangeInput },
    setup() {
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
      return { args, value };
    },
    template: `<VcDateRangeInput v-bind="args" v-model="value" />`,
  }),
};

export const PartialRange: StoryType = {
  args: { label: "Order date range" },
  parameters: {
    docs: {
      description: {
        story: "Only the start date is filled in; the range stays valid until both bounds disagree in order.",
      },
      source: {
        code: `
          <!-- value ref starts at { start: "2026-10-08" } -->
          <VcDateRangeInput v-model="value" label="Order date range" />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangeInput },
    setup() {
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: undefined });
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDateRangeInput v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">Range: {{ value ?? "(none)" }}</div>
      </div>
    `,
  }),
};
