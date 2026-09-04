import { computed, ref } from "vue";
import { VcCalendar } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];
const WEEKDAY_FORMATS = ["narrow", "short"];

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
    month: {
      control: "text",
      description: "Displayed month, as any date inside it in YYYY-MM-DD format",
      table: { type: { summary: "string" } },
    },
    showFooter: {
      control: "boolean",
    },
    locale: {
      control: "text",
    },
    dayDescriptions: {
      control: "object",
      description: "ISO `YYYY-MM-DD` → screen-reader text for that day",
      table: { type: { summary: "Record<string, string>" } },
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
        code: `<VcCalendar v-model="value" :first-day-of-week="1" />`,
      },
    },
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
  parameters: {
    docs: {
      source: {
        code: `
          <!-- value ref starts at "2026-10-15" -->
          <VcCalendar v-model="value" :first-day-of-week="1" />
        `,
      },
    },
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
  parameters: {
    docs: {
      source: {
        code: `
          <VcCalendar
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
      source: {
        code: `
          <!-- disabledDate returns true for weekends -->
          <VcCalendar
            v-model="value"
            :first-day-of-week="1"
            :disabled-date="(iso) => [0, 6].includes(new Date(iso).getDay())"
          />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcCalendar },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      const disabledDate = (iso: string) => {
        const d = new Date(`${iso}T00:00:00Z`);
        const dow = d.getUTCDay();
        return dow === 0 || dow === 6;
      };
      return { args, value, disabledDate };
    },
    template: `<VcCalendar v-bind="args" v-model="value" :disabled-date="disabledDate" />`,
  }),
};

export const KeyboardBoundsWithDisabledDates: StoryType = {
  args: {
    weekdayFormat: "short",
    firstDayOfWeek: 0,
    min: "2026-06-10",
    max: "2026-06-20",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Verifies that Home/End/PageUp/PageDown keyboard navigation never moves focus outside `[min, max]` even when the targeted week/month boundary date is disabled or out of range. Both the navigation target and the availability-walk boundary are clamped to the min/max window. Focus a mid-window day (e.g. June 17), then press Home/End/PageUp/PageDown and confirm focus stays within June 10–20.",
      },
      source: {
        code: `
          <!-- disabledDate marks 10th, 11th, 14th, 20th unavailable inside the [min, max] window -->
          <VcCalendar
            v-model="value"
            :first-day-of-week="0"
            min="2026-06-10"
            max="2026-06-20"
            :disabled-date="(iso) => ['2026-06-10', '2026-06-11', '2026-06-14', '2026-06-20'].includes(iso)"
          />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcCalendar },
    setup() {
      const value = ref<string | undefined>("2026-06-17");
      const disabledDate = (iso: string) => {
        return ["2026-06-10", "2026-06-11", "2026-06-14", "2026-06-20"].includes(iso);
      };
      return { args, value, disabledDate };
    },
    template: `
      <div class="space-y-2">
        <VcCalendar v-bind="args" v-model="value" :disabled-date="disabledDate" />
        <div class="text-sm text-neutral-600">Selected: {{ value || "(none)" }}</div>
      </div>
    `,
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
        code: `<VcCalendar v-model="value" :first-day-of-week="1" show-footer />`,
      },
    },
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

export const SizeXs: StoryType = {
  args: {
    size: "xs",
    weekdayFormat: "narrow",
    firstDayOfWeek: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          '`size: xs` — compact 28px cells suited for inline pickers and density-constrained surfaces. Pair with `weekday-format="narrow"` so the single-letter weekday labels fit the cell width.',
      },
      source: {
        code: `<VcCalendar v-model="value" :first-day-of-week="1" size="xs" weekday-format="narrow" />`,
      },
    },
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

export const SizeSm: StoryType = {
  args: {
    size: "sm",
    weekdayFormat: "short",
    firstDayOfWeek: 1,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcCalendar v-model="value" :first-day-of-week="1" size="sm" />`,
      },
    },
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

export const FirstDaySunday: StoryType = {
  args: {
    firstDayOfWeek: 0,
    weekdayFormat: "short",
  },
  parameters: {
    docs: {
      description: {
        story: "Week starts on Sunday (US convention). Compare with the default Monday-first stories above.",
      },
      source: {
        code: `
          <!-- US-style week starts on Sunday -->
          <VcCalendar v-model="value" :first-day-of-week="0" />
        `,
      },
    },
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
  parameters: {
    docs: {
      source: {
        code: `<VcCalendar v-model="value" :first-day-of-week="1" locale="ru-RU" />`,
      },
    },
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
  parameters: {
    docs: {
      source: {
        code: `<VcCalendar v-model="value" locale="ja-JP" />`,
      },
    },
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

export const LocaleLongMonthName: StoryType = {
  args: {
    locale: "fr-FR",
    firstDayOfWeek: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Long month names (e.g., French 'septembre') don't expand calendar width — heading truncates with ellipsis instead. Calendar width is deterministic: 7 × cell-size + 6 × grid-gap + 2 × padding.",
      },
      source: {
        code: `<!-- value defaults to 2026-09-15 to land on a long-name month -->
<VcCalendar v-model="value" locale="fr-FR" :first-day-of-week="1" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcCalendar },
    setup() {
      const value = ref<string | undefined>("2026-09-15");
      return { args, value };
    },
    template: `<VcCalendar v-bind="args" v-model="value" />`,
  }),
};

export const WithDayMarkers: StoryType = {
  args: {
    weekdayFormat: "short",
    firstDayOfWeek: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "The calendar owns no marker concept: the dots below are the story's own markup, rendered through the `day` slot, which fires *after* the day number the calendar keeps drawing itself. Dedupe, ordering, colour and any cap are the consumer's — here Oct 8 holds nine overdue tasks and collapses to one dot, and Oct 27 has five kinds trimmed to four. What the slot cannot do is talk to a screen reader: reka puts an explicit `aria-label` (the full date) on the cell trigger, so slot content never reaches the accessible name. That is what `day-descriptions` is for — the calendar renders it as a visually hidden span and wires up `aria-describedby`, so the day announces as its date followed by the description.",
      },
      source: {
        code: `
          <VcCalendar v-model="value" :first-day-of-week="1" :day-descriptions="dayDescriptions">
            <template #day="{ date }">
              <span v-if="kindsFor(date).length" class="task-dots">
                <span v-for="kind in kindsFor(date)" :key="kind" :class="DOT_CLASSES[kind]" />
              </span>
            </template>
          </VcCalendar>
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcCalendar },
    setup() {
      const value = ref<string | undefined>("2026-10-15");

      // Everything below is consumer-side: the order dots appear in, their colour, their cap.
      const KIND_ORDER = ["upcoming", "overdue", "completed", "blocked", "draft"];
      const MAX_DOTS = 4;
      const DOT_CLASSES: Record<string, string> = {
        upcoming: "bg-info-500",
        overdue: "bg-danger-500",
        completed: "bg-success-500",
        blocked: "bg-warning-500",
        draft: "bg-neutral-500",
      };
      const KIND_LABELS: Record<string, string> = {
        upcoming: "Upcoming",
        overdue: "Overdue",
        completed: "Completed",
        blocked: "Blocked",
        draft: "Draft",
      };

      // Raw per-day items, as a fetch would hand them over — repeated, unordered, unfiltered.
      const itemsByDay: Record<string, string[]> = {
        "2026-09-30": ["completed"],
        "2026-10-02": ["upcoming"],
        "2026-10-06": ["upcoming", "overdue"],
        "2026-10-08": Array.from({ length: 9 }, () => "overdue"),
        "2026-10-13": ["completed"],
        "2026-10-15": ["upcoming", "overdue", "completed"],
        "2026-10-20": ["completed", "overdue", "upcoming"],
        "2026-10-22": ["blocked"],
        "2026-10-23": ["upcoming", "cancelled"],
        "2026-10-27": ["upcoming", "overdue", "completed", "blocked", "draft"],
        "2026-11-03": ["overdue"],
      };

      // One dot per kind present, in a stable order, capped — a set test, not a per-item loop.
      function kindsFor(date: string): string[] {
        const present = new Set(itemsByDay[date] ?? []);
        return KIND_ORDER.filter((kind) => present.has(kind)).slice(0, MAX_DOTS);
      }

      const dayDescriptions = computed<Record<string, string>>(() => {
        const result: Record<string, string> = {};
        for (const date of Object.keys(itemsByDay)) {
          const labels = kindsFor(date).map((kind) => KIND_LABELS[kind]);
          if (labels.length) {
            result[date] = `Marked: ${labels.join(", ")}`;
          }
        }
        return result;
      });

      return { args, value, dayDescriptions, kindsFor, DOT_CLASSES };
    },
    template: `
      <div class="space-y-2">
        <VcCalendar v-bind="args" v-model="value" :day-descriptions="dayDescriptions">
          <template #day="{ date }">
            <span
              v-if="kindsFor(date).length"
              class="pointer-events-none absolute inset-x-0 bottom-1 flex justify-center gap-0.5"
            >
              <span
                v-for="kind in kindsFor(date)"
                :key="kind"
                class="size-1 rounded-full"
                :class="DOT_CLASSES[kind]"
              />
            </span>
          </template>
        </VcCalendar>
        <div class="text-sm text-neutral-600">Selected: {{ value || "(none)" }}</div>
      </div>
    `,
  }),
};

export const MonthNavigation: StoryType = {
  args: {
    weekdayFormat: "short",
    firstDayOfWeek: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "`update:month` reports the displayed month as the ISO first-of-month — once on mount, then on every month change (header arrows, year arrows, keyboard paging, or a `model-value` jump). That is the hook for per-month fetching: the dots below are rebuilt for whichever month is on screen. Pairing it with the `month` prop (`v-model:month`) also lets a consumer drive the view from outside.",
      },
      source: {
        code: `
          <VcCalendar v-model="value" v-model:month="displayedMonth" :day-descriptions="dayDescriptions">
            <template #day="{ date }">…</template>
          </VcCalendar>
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcCalendar },
    setup() {
      const value = ref<string | undefined>(undefined);
      const displayedMonth = ref("2026-10-01");

      // Stands in for a per-month fetch: whichever month is displayed, mark its 4th, 11th and 19th.
      const itemsByDay = computed<Record<string, string[]>>(() => {
        const prefix = displayedMonth.value.slice(0, 8);
        return {
          [`${prefix}04`]: ["upcoming"],
          [`${prefix}11`]: ["overdue"],
          [`${prefix}19`]: ["upcoming", "overdue"],
        };
      });

      const DOT_CLASSES: Record<string, string> = { upcoming: "bg-info-500", overdue: "bg-danger-500" };

      function kindsFor(date: string): string[] {
        return itemsByDay.value[date] ?? [];
      }

      const dayDescriptions = computed<Record<string, string>>(() => {
        const result: Record<string, string> = {};
        for (const [date, kinds] of Object.entries(itemsByDay.value)) {
          result[date] = `Marked: ${kinds.join(", ")}`;
        }
        return result;
      });

      return { args, value, displayedMonth, dayDescriptions, kindsFor, DOT_CLASSES };
    },
    template: `
      <div class="space-y-2">
        <VcCalendar
          v-bind="args"
          v-model="value"
          v-model:month="displayedMonth"
          :day-descriptions="dayDescriptions"
        >
          <template #day="{ date }">
            <span
              v-if="kindsFor(date).length"
              class="pointer-events-none absolute inset-x-0 bottom-1 flex justify-center gap-0.5"
            >
              <span
                v-for="kind in kindsFor(date)"
                :key="kind"
                class="size-1 rounded-full"
                :class="DOT_CLASSES[kind]"
              />
            </span>
          </template>
        </VcCalendar>
        <div class="text-sm text-neutral-600">Displayed month: {{ displayedMonth }}</div>
      </div>
    `,
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
      source: {
        code: `
          <!-- value is today's ISO date -->
          <VcCalendar v-model="value" :first-day-of-week="1" />
        `,
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
