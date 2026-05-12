import { ref } from "vue";
import { VcRangeCalendar } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["sm", "md"];
const WEEKDAY_FORMATS = ["narrow", "short", "long"];

const meta: Meta<typeof VcRangeCalendar> = {
  title: "Components/Molecules/VcRangeCalendar",
  component: VcRangeCalendar,
  argTypes: {
    size: {
      control: "inline-radio",
      options: SIZES,
      type: { name: "string", required: false },
      table: { type: { summary: SIZES.join(" | ") } },
    },
    weekdayFormat: {
      control: "inline-radio",
      options: WEEKDAY_FORMATS,
      type: { name: "string", required: false },
      table: { type: { summary: WEEKDAY_FORMATS.join(" | ") } },
    },
    min: {
      control: "text",
      description: "Minimum date in YYYY-MM-DD format",
      table: { type: { summary: "string" } },
    },
    max: {
      control: "text",
      description: "Maximum date in YYYY-MM-DD format",
      table: { type: { summary: "string" } },
    },
    showFooter: {
      control: "boolean",
    },
    locale: {
      control: "text",
    },
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Default: StoryType = {
  args: {
    weekdayFormat: "short",
    firstDayOfWeek: 1,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcRangeCalendar v-model="value" :first-day-of-week="1" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcRangeCalendar },
    setup() {
      const value = ref<{ start?: string; end?: string }>({ start: undefined, end: undefined });
      return { args, value };
    },
    template: `<VcRangeCalendar v-bind="args" v-model="value" />`,
  }),
};

export const Committed: StoryType = {
  args: {
    weekdayFormat: "short",
    firstDayOfWeek: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Multi-day committed range. Endpoints render with primary-500 fill and rounded outer corners; middle cells form a continuous primary-100 band.",
      },
      source: {
        code: `
          <!-- value ref starts at { start: "2026-10-08", end: "2026-10-14" } -->
          <VcRangeCalendar v-model="value" :first-day-of-week="1" />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcRangeCalendar },
    setup() {
      const value = ref<{ start?: string; end?: string }>({ start: "2026-10-08", end: "2026-10-14" });
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcRangeCalendar v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">Range: {{ value.start || "(none)" }} → {{ value.end || "(none)" }}</div>
      </div>
    `,
  }),
};

export const SingleDay: StoryType = {
  args: {
    weekdayFormat: "short",
    firstDayOfWeek: 1,
  },
  parameters: {
    docs: {
      description: {
        story: "Range with start === end. Should render as a single fully-rounded primary-500 cell, not a square cell.",
      },
      source: {
        code: `
          <!-- value ref starts at { start: "2026-10-15", end: "2026-10-15" } -->
          <VcRangeCalendar v-model="value" :first-day-of-week="1" />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcRangeCalendar },
    setup() {
      const value = ref<{ start?: string; end?: string }>({ start: "2026-10-15", end: "2026-10-15" });
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcRangeCalendar v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">Range: {{ value.start || "(none)" }} → {{ value.end || "(none)" }}</div>
      </div>
    `,
  }),
};

export const WithMinMax: StoryType = {
  args: {
    weekdayFormat: "short",
    firstDayOfWeek: 1,
    min: "2026-10-05",
    max: "2026-10-25",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcRangeCalendar
            v-model="value"
            :first-day-of-week="1"
            min="2026-10-05"
            max="2026-10-25"
          />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcRangeCalendar },
    setup() {
      const value = ref<{ start?: string; end?: string }>({ start: undefined, end: undefined });
      return { args, value };
    },
    template: `<VcRangeCalendar v-bind="args" v-model="value" />`,
  }),
};

export const WithDisabledDates: StoryType = {
  args: {
    weekdayFormat: "short",
    firstDayOfWeek: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "`disabledDate` predicate marks weekends as unavailable (data-unavailable) — distinct from min/max disabled.",
      },
      source: {
        code: `
          <VcRangeCalendar
            v-model="value"
            :first-day-of-week="1"
            :disabled-date="(iso) => [0, 6].includes(new Date(iso).getDay())"
          />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcRangeCalendar },
    setup() {
      const value = ref<{ start?: string; end?: string }>({ start: undefined, end: undefined });
      const disabledDate = (iso: string) => {
        const d = new Date(`${iso}T00:00:00Z`);
        const dow = d.getUTCDay();
        return dow === 0 || dow === 6;
      };
      return { args, value, disabledDate };
    },
    template: `<VcRangeCalendar v-bind="args" v-model="value" :disabled-date="disabledDate" />`,
  }),
};

export const WithFooter: StoryType = {
  args: {
    weekdayFormat: "short",
    firstDayOfWeek: 1,
    showFooter: true,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcRangeCalendar v-model="value" :first-day-of-week="1" show-footer />`,
      },
    },
  },
  render: (args) => ({
    components: { VcRangeCalendar },
    setup() {
      const value = ref<{ start?: string; end?: string }>({ start: undefined, end: undefined });
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcRangeCalendar v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">Range: {{ value.start || "(none)" }} → {{ value.end || "(none)" }}</div>
      </div>
    `,
  }),
};

export const SizeSm: StoryType = {
  args: {
    size: "sm",
    weekdayFormat: "short",
    firstDayOfWeek: 1,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcRangeCalendar v-model="value" :first-day-of-week="1" size="sm" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcRangeCalendar },
    setup() {
      const value = ref<{ start?: string; end?: string }>({ start: "2026-10-08", end: "2026-10-14" });
      return { args, value };
    },
    template: `<VcRangeCalendar v-bind="args" v-model="value" />`,
  }),
};
