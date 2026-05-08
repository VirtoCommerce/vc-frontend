import { ref } from "vue";
import { VcCalendar } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["sm", "md"];
const WEEKDAY_FORMATS = ["narrow", "short", "long"];

const meta: Meta<typeof VcCalendar> = {
  title: "Components/Molecules/VcCalendar",
  component: VcCalendar,
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
  render: (args) => ({
    components: { VcCalendar },
    setup() {
      const value = ref<string | undefined>(undefined);
      return { args, value };
    },
    template: `<VcCalendar v-bind="args" v-model="value" />`,
  }),
};

export const Selected: StoryType = {
  args: {
    weekdayFormat: "short",
    firstDayOfWeek: 1,
  },
  render: (args) => ({
    components: { VcCalendar },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcCalendar v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">Selected: {{ value || "(none)" }}</div>
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
  render: (args) => ({
    components: { VcCalendar },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `<VcCalendar v-bind="args" v-model="value" />`,
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
    },
  },
  render: (args) => ({
    components: { VcCalendar },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      const disabledDate = (iso: string) => {
        // ISO YYYY-MM-DD parsed as UTC date for stable weekday calculation
        const d = new Date(`${iso}T00:00:00Z`);
        const dow = d.getUTCDay();
        return dow === 0 || dow === 6;
      };
      return { args, value, disabledDate };
    },
    template: `<VcCalendar v-bind="args" v-model="value" :disabled-date="disabledDate" />`,
  }),
};

export const WithFooter: StoryType = {
  args: {
    weekdayFormat: "short",
    firstDayOfWeek: 1,
    showFooter: true,
  },
  render: (args) => ({
    components: { VcCalendar },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcCalendar v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">Selected: {{ value || "(none)" }}</div>
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
  render: (args) => ({
    components: { VcCalendar },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `<VcCalendar v-bind="args" v-model="value" />`,
  }),
};

export const LocaleRu: StoryType = {
  args: {
    weekdayFormat: "short",
    firstDayOfWeek: 1,
    locale: "ru-RU",
  },
  render: (args) => ({
    components: { VcCalendar },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `<VcCalendar v-bind="args" v-model="value" />`,
  }),
};

export const LocaleJa: StoryType = {
  args: {
    weekdayFormat: "short",
    locale: "ja-JP",
  },
  render: (args) => ({
    components: { VcCalendar },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `<VcCalendar v-bind="args" v-model="value" />`,
  }),
};

export const BoundaryToday: StoryType = {
  args: {
    weekdayFormat: "short",
    firstDayOfWeek: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Selecting today's date exercises the combined `data-today` + `data-selected` styling (filled cell, today ring suppressed by selected styling).",
      },
    },
  },
  render: (args) => ({
    components: { VcCalendar },
    setup() {
      const todayIso = new Date().toISOString().slice(0, 10);
      const value = ref<string | undefined>(todayIso);
      return { args, value };
    },
    template: `<VcCalendar v-bind="args" v-model="value" />`,
  }),
};
