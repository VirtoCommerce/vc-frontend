import { ref } from "vue";
import VcRangeCalendar from "./vc-range-calendar.vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];
const WEEKDAY_FORMATS = ["narrow", "short"];

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
    firstDayOfWeek: {
      control: "select",
      options: [0, 1, 2, 3, 4, 5, 6],
      description: "0 = Sunday, 1 = Monday, ..., 6 = Saturday",
      table: { type: { summary: "0 | 1 | 2 | 3 | 4 | 5 | 6" } },
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
      const value = ref<VcDateRangeType | undefined>(undefined);
      return { args, value };
    },
    template: `<VcRangeCalendar v-bind="args" v-model="value" />`,
  }),
};

export const CommittedRange: StoryType = {
  args: {
    weekdayFormat: "short",
    firstDayOfWeek: 1,
  },
  parameters: {
    docs: {
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
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcRangeCalendar v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">Selected: {{ value?.start || "(none)" }} — {{ value?.end || "(none)" }}</div>
      </div>
    `,
  }),
};

export const SingleDayRange: StoryType = {
  args: {
    weekdayFormat: "short",
    firstDayOfWeek: 1,
  },
  parameters: {
    docs: {
      description: {
        story: "A range where start and end fall on the same day — exercises the combined-endpoint full-radius cell.",
      },
      source: {
        code: `
          <!-- value ref starts at { start: "2026-10-08", end: "2026-10-08" } -->
          <VcRangeCalendar v-model="value" :first-day-of-week="1" />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcRangeCalendar },
    setup() {
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-08" });
      return { args, value };
    },
    template: `<VcRangeCalendar v-bind="args" v-model="value" />`,
  }),
};

export const Small: StoryType = {
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
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
      return { args, value };
    },
    template: `<VcRangeCalendar v-bind="args" v-model="value" />`,
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
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcRangeCalendar v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">Selected: {{ value?.start || "(none)" }} — {{ value?.end || "(none)" }}</div>
      </div>
    `,
  }),
};

export const MinMax: StoryType = {
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
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
      return { args, value };
    },
    template: `<VcRangeCalendar v-bind="args" v-model="value" />`,
  }),
};

export const Unavailable: StoryType = {
  args: {
    weekdayFormat: "short",
    firstDayOfWeek: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "`disabledDate` predicate marks weekends as unavailable (data-unavailable) — distinct from min/max disabled. An unavailable day cannot be picked as an endpoint, but a range may span one: the seeded range runs across a weekend, and those two days keep their strike-through inside the band.",
      },
      source: {
        code: `
          <!-- disabledDate returns true for weekends -->
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
      const value = ref<VcDateRangeType | undefined>({ start: "2026-10-08", end: "2026-10-14" });
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
