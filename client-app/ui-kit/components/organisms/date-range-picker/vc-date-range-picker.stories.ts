import { ref } from "vue";
import VcDateRangePicker from "./vc-date-range-picker.vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["sm", "md"];
const LAYOUTS = ["combined", "split"];
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

const meta: Meta<typeof VcDateRangePicker> = {
  title: "Components/Organisms/VcDateRangePicker",
  component: VcDateRangePicker,
  decorators: [() => ({ template: '<div id="popover-host"></div><story />' })],
  parameters: {
    docs: {
      description: {
        component:
          'Date-range picker organism composing `VcDateRangeInput`, a calendar trigger button (`VcButton` in the input\'s append slot), and a `VcPopover` anchored to the input that hosts a `VcRangeCalendar`. ARIA: the combobox semantics live on the calendar toggle button (`aria-haspopup="dialog"`, `aria-expanded`), not on the segment inputs — the popover content carries `role="dialog"` with a localized `aria-label`. Picking the SECOND endpoint via the calendar closes the popover by default (`closeOnSelect`) and returns focus to the input; picking the first (anchor) endpoint keeps it open.',
      },
    },
  },
  argTypes: {
    // Global type alias — docgen cannot infer the options.
    layout: {
      control: "select",
      options: LAYOUTS,
      description: '"combined" = one field with two segments. "split" = two separate labelled fields.',
      type: { name: "string", required: false },
      table: { type: { summary: LAYOUTS.join(" | ") }, defaultValue: { summary: "combined" } },
    },
    size: {
      control: "inline-radio",
      options: SIZES,
      type: { name: "string", required: false },
      table: { type: { summary: SIZES.join(" | ") } },
    },
    placement: {
      control: "select",
      options: PLACEMENTS,
      type: { name: "string", required: false },
      table: { type: { summary: PLACEMENTS.join(" | ") } },
    },
    firstDayOfWeek: {
      control: "select",
      options: [0, 1, 2, 3, 4, 5, 6],
      description: "0 = Sunday, 1 = Monday, ..., 6 = Saturday",
      table: { type: { summary: "0 | 1 | 2 | 3 | 4 | 5 | 6" } },
    },
    min: {
      control: "text",
      description: "Minimum date in ISO YYYY-MM-DD format",
      table: { type: { summary: "string" } },
    },
    max: {
      control: "text",
      description: "Maximum date in ISO YYYY-MM-DD format",
      table: { type: { summary: "string" } },
    },
    locale: {
      control: "text",
      description: "Override locale; defaults to active i18n locale",
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
    showFooter: { control: "boolean" },
    closeOnSelect: { control: "boolean" },
    enableTeleport: { control: "boolean" },
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Default: StoryType = {
  args: { label: "Order date range" },
  parameters: {
    docs: {
      source: {
        code: `<VcDateRangePicker v-model="value" label="Order date range" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangePicker },
    setup() {
      const value = ref<VcDateRangeType | undefined>(undefined);
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDateRangePicker v-bind="args" v-model="value" />
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
          <VcDateRangePicker v-model="value" label="Order date range" />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangePicker },
    setup() {
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDateRangePicker v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">Range: {{ value ?? "(none)" }}</div>
      </div>
    `,
  }),
};

export const Split: StoryType = {
  args: {
    label: "Order date range",
    layout: "split",
    startLabel: "Start date",
    endLabel: "End date",
    clearable: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '`layout="split"` renders two independent `VcDatePicker`s with visible `startLabel` / `endLabel`, an en dash between them and ONE shared details row. Each calendar is cross-bounded by the opposite endpoint — the start calendar cannot go past the current end date and vice versa — so an out-of-order range is unreachable by mouse. Typing one is still possible, and surfaces the `invalid_range` message in the shared details row.',
      },
      source: {
        code: `
          <VcDateRangePicker
            v-model="value"
            layout="split"
            label="Order date range"
            start-label="Start date"
            end-label="End date"
            clearable
          />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangePicker },
    setup() {
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDateRangePicker v-bind="args" v-model="value" />
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
        code: `<VcDateRangePicker v-model="value" label="Order date range" size="sm" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangePicker },
    setup() {
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
      return { args, value };
    },
    template: `<VcDateRangePicker v-bind="args" v-model="value" />`,
  }),
};

export const Disabled: StoryType = {
  args: { label: "Order date range", disabled: true },
  parameters: {
    docs: {
      description: {
        story: "Disabled state — both segments are non-interactive and the calendar trigger is also disabled.",
      },
      source: {
        code: `<VcDateRangePicker v-model="value" label="Order date range" disabled />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangePicker },
    setup() {
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
      return { args, value };
    },
    template: `<VcDateRangePicker v-bind="args" v-model="value" />`,
  }),
};

export const ErrorState: StoryType = {
  args: { label: "Order date range", error: true, message: "End date must be after the start date" },
  parameters: {
    docs: {
      description: {
        story:
          "Simulates a vee-validate error: `error` forces the shell's error styling and the external `message` wins.",
      },
      source: {
        code: `
          <VcDateRangePicker
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
    components: { VcDateRangePicker },
    setup() {
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-20", end: "2026-10-01" });
      return { args, value };
    },
    template: `<VcDateRangePicker v-bind="args" v-model="value" />`,
  }),
};

export const Clearable: StoryType = {
  args: { label: "Order date range", clearable: true },
  parameters: {
    docs: {
      description: {
        story: "A single shell-level clear button resets both endpoints at once.",
      },
      source: {
        code: `<VcDateRangePicker v-model="value" label="Order date range" clearable />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangePicker },
    setup() {
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDateRangePicker v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">Range: {{ value ?? "(none)" }}</div>
      </div>
    `,
  }),
};

export const WithFooter: StoryType = {
  args: { label: "Order date range", firstDayOfWeek: 1, showFooter: true },
  parameters: {
    docs: {
      description: {
        story: "`showFooter: true` exposes a Clear button inside the calendar.",
      },
      source: {
        code: `<VcDateRangePicker v-model="value" label="Order date range" :first-day-of-week="1" show-footer />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangePicker },
    setup() {
      const value = ref<VcDateRangeType | undefined>(undefined);
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDateRangePicker v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">Range: {{ value ?? "(none)" }}</div>
      </div>
    `,
  }),
};

export const MinMax: StoryType = {
  args: {
    label: "Order date range",
    min: "2026-10-05",
    max: "2026-10-25",
    message: "Pick dates between 2026-10-05 and 2026-10-25",
  },
  parameters: {
    docs: {
      description: {
        story:
          'Both segments and the calendar enforce the same min/max boundary. Dates outside the range render as disabled cells in the calendar; typing an out-of-range date surfaces an inline validation error naming the boundary it broke, not a generic format complaint. Type `10/01/2026` (before `min`) into either layout and tab out: the shared details row reads "Date must be on or after 2026-10-05". `11/01/2026` (after `max`) reports the max boundary, and only genuinely unparseable text such as `99/99/9999` falls back to "Invalid date format". Both layouts are shown because each surfaces its segments\' messages through its own shared details row.',
      },
      source: {
        code: `
          <VcDateRangePicker
            v-model="value"
            label="Order date range"
            min="2026-10-05"
            max="2026-10-25"
          />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangePicker },
    setup() {
      const combined = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
      const split = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
      return { args, combined, split };
    },
    template: `
      <div class="space-y-6">
        <div class="space-y-2">
          <VcDateRangePicker v-bind="args" v-model="combined" layout="combined" />
          <div class="text-sm text-neutral-600">Combined range: {{ combined ?? "(none)" }}</div>
        </div>

        <div class="space-y-2">
          <VcDateRangePicker v-bind="args" v-model="split" layout="split" />
          <div class="text-sm text-neutral-600">Split range: {{ split ?? "(none)" }}</div>
        </div>
      </div>
    `,
  }),
};

export const Teleport: StoryType = {
  args: { label: "Order date range", enableTeleport: true },
  parameters: {
    docs: {
      description: {
        story:
          "`enable-teleport` renders the calendar popover into `#popover-host` (the app-level host element). Use this when the picker sits inside a clipping container — a modal, dialog, or any ancestor with `overflow: hidden` — so the calendar can escape the clip and float over surrounding UI. This story wraps the picker in an `overflow: hidden` box to demonstrate the escape.",
      },
      source: {
        code: `
          <div style="overflow: hidden; height: 12rem; border: 1px dashed">
            <VcDateRangePicker v-model="value" label="Order date range" :enable-teleport="true" />
          </div>
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcDateRangePicker },
    setup() {
      const value = ref<VcDateRangeType | undefined>(undefined);
      return { args, value };
    },
    template: `
      <div style="overflow: hidden; height: 12rem; padding: 1rem; border: 1px dashed var(--color-neutral-400)">
        <VcDateRangePicker v-bind="args" v-model="value" />
      </div>
    `,
  }),
};
