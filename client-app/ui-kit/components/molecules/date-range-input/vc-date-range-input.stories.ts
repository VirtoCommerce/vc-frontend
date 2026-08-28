import { ref } from "vue";
import VcDateRangeInput from "./vc-date-range-input.vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];

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
    mask: { control: "boolean" },
    showEmptyDetails: {
      control: "boolean",
      description: "Keep the details row's height reserved while it has no message, so the layout below never shifts.",
    },
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Default: StoryType = {
  args: { label: "Date range" },
  parameters: {
    docs: {
      source: {
        code: `<VcDateRangeInput v-model="value" label="Date range" />`,
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
  args: { label: "Date range" },
  parameters: {
    docs: {
      source: {
        code: `
          <!-- value ref starts at { start: "2026-10-08", end: "2026-10-14" } -->
          <VcDateRangeInput v-model="value" label="Date range" />
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
  args: { label: "Date range", size: "sm" },
  parameters: {
    docs: {
      source: {
        code: `<VcDateRangeInput v-model="value" label="Date range" size="sm" />`,
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
  args: { label: "Date range", disabled: true },
  parameters: {
    docs: {
      source: {
        code: `<VcDateRangeInput v-model="value" label="Date range" disabled />`,
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
  args: { label: "Date range", error: true, message: "End date must be after the start date" },
  parameters: {
    docs: {
      description: {
        story: "Single error row for the whole shell — segments never render their own.",
      },
      source: {
        code: `
          <VcDateRangeInput
            v-model="value"
            label="Date range"
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
  args: { label: "Date range", clearable: true },
  parameters: {
    docs: {
      description: {
        story: "A single shell-level clear button resets both segments at once.",
      },
      source: {
        code: `<VcDateRangeInput v-model="value" label="Date range" clearable />`,
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
  args: { label: "Date range", clearable: true, disabled: true },
  parameters: {
    docs: {
      description: {
        story:
          "Matches VcInput's own idiom: the clear button is hidden entirely (not just disabled) when the field is disabled or readonly.",
      },
      source: {
        code: `<VcDateRangeInput v-model="value" label="Date range" clearable disabled />`,
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
  args: { label: "Date range" },
  parameters: {
    docs: {
      description: {
        story: "Only the start date is filled in; the range stays valid until both bounds disagree in order.",
      },
      source: {
        code: `
          <!-- value ref starts at { start: "2026-10-08" } -->
          <VcDateRangeInput v-model="value" label="Date range" />
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

export const WithMask: StoryType = {
  args: { label: "Date range", mask: true },
  parameters: {
    docs: {
      description: {
        story:
          "`mask: true` enables a locale-aware input mask on BOTH segments. Separators are auto-inserted as digits are typed, and a paste of a recognizable date format is reformatted into the locale's display format. This is what the orders filter ships, so it is the typing experience to check first.",
      },
      source: {
        code: `<VcDateRangeInput v-model="value" label="Date range" mask />`,
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

export const ReservedDetailsRow: StoryType = {
  args: { label: "Date range", mask: true },
  parameters: {
    docs: {
      description: {
        story:
          "`showEmptyDetails` reserves the details row's height while there is no message, so nothing below the field moves when validation appears. The two fields here are identical except for that prop, which is pinned per instance here rather than driven by the toolbar control: type `99/99/9999` into the start segment of each and tab out — only the right one pushes the text beneath it down.",
      },
      source: {
        code: `<VcDateRangeInput v-model="value" label="Date range" mask show-empty-details />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangeInput },
    setup() {
      const reserved = ref<VcDateRangeType | undefined>(undefined);
      const collapsing = ref<VcDateRangeType | undefined>(undefined);
      return { args, reserved, collapsing };
    },
    template: `
      <div class="grid max-w-2xl grid-cols-2 gap-6">
        <div>
          <VcDateRangeInput v-bind="args" v-model="reserved" show-empty-details />
          <div class="text-sm text-neutral-600">show-empty-details</div>
        </div>

        <div>
          <VcDateRangeInput v-bind="args" v-model="collapsing" :show-empty-details="false" />
          <div class="text-sm text-neutral-600">default</div>
        </div>
      </div>
    `,
  }),
};
