import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import jaMessages from "@/ui-kit/locales/ja.json";
import { VcDatePicker } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];
const UPDATE_ON = ["blur", "enter"];
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

// Module-level helper to satisfy sonarjs/no-identical-functions across stories.
function isWeekend(iso: string): boolean {
  const date = new Date(`${iso}T00:00:00Z`);
  const dayOfWeek = date.getUTCDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

const meta: Meta<typeof VcDatePicker> = {
  title: "Components/Organisms/VcDatePicker",
  component: VcDatePicker,
  parameters: {
    docs: {
      description: {
        component:
          'Date picker organism composing `VcDateInput`, a calendar trigger button (`VcButton` in the input\'s append slot), and a `VcPopover` anchored to the input that hosts a `VcCalendar`. Single-mode selection only — range selection lives on a separate branch. ARIA: the inner input advertises `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls` pointing at the popover content; the popover content carries `role="dialog"` with a localized `aria-label`. Picking a date via the calendar closes the popover by default (`closeOnSelect`) and returns focus to the input.',
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
    updateOn: {
      control: "inline-radio",
      options: UPDATE_ON,
      type: { name: "string", required: false },
      table: { type: { summary: UPDATE_ON.join(" | ") } },
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
    placeholder: { control: "text" },
    message: { control: "text" },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
    required: { control: "boolean" },
    clearable: { control: "boolean" },
    error: { control: "boolean" },
    mask: { control: "boolean" },
    showFooter: { control: "boolean" },
    closeOnSelect: { control: "boolean" },
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Default: StoryType = {
  args: {},
  parameters: {
    docs: {
      source: {
        code: `<VcDatePicker v-model="value" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref<string | undefined>(undefined);
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDatePicker v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">ISO value: {{ value || "(none)" }}</div>
      </div>
    `,
  }),
};

export const WithLabel: StoryType = {
  args: { label: "Order date" },
  parameters: {
    docs: {
      source: {
        code: `<VcDatePicker v-model="value" label="Order date" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref<string | undefined>(undefined);
      return { args, value };
    },
    template: `<VcDatePicker v-bind="args" v-model="value" />`,
  }),
};

export const WithValue: StoryType = {
  args: { label: "Order date" },
  parameters: {
    docs: {
      source: {
        code: `
          <!-- value ref starts at "2026-10-15" -->
          <VcDatePicker v-model="value" label="Order date" />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDatePicker v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">ISO value: {{ value || "(none)" }}</div>
      </div>
    `,
  }),
};

export const WithMinMax: StoryType = {
  args: {
    label: "Order date",
    min: "2026-10-05",
    max: "2026-10-25",
    message: "Pick a date between 2026-10-05 and 2026-10-25",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Both the text input and the calendar enforce the same min/max boundary. Dates outside the range render as disabled cells in the calendar; typing an out-of-range date in the input surfaces an inline validation error.",
      },
      source: {
        code: `
          <VcDatePicker
            v-model="value"
            label="Order date"
            min="2026-10-05"
            max="2026-10-25"
          />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDatePicker v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">ISO value: {{ value || "(none)" }}</div>
      </div>
    `,
  }),
};

export const WithDisabledDates: StoryType = {
  args: {
    label: "Order date",
    firstDayOfWeek: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "`disabledDate` predicate marks weekends as unavailable in the calendar — distinct from min/max disabled.",
      },
      source: {
        code: `
          <!-- disabledDate returns true for weekends -->
          <VcDatePicker
            v-model="value"
            label="Order date"
            :first-day-of-week="1"
            :disabled-date="(iso) => [0, 6].includes(new Date(iso + 'T00:00:00Z').getUTCDay())"
          />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value, disabledDate: isWeekend };
    },
    template: `
      <div class="space-y-2">
        <VcDatePicker v-bind="args" v-model="value" :disabled-date="disabledDate" />
        <div class="text-sm text-neutral-600">ISO value: {{ value || "(none)" }}</div>
      </div>
    `,
  }),
};

export const WithFooter: StoryType = {
  args: {
    label: "Order date",
    firstDayOfWeek: 1,
    showFooter: true,
  },
  parameters: {
    docs: {
      description: {
        story: "`showFooter: true` exposes Today / Clear buttons inside the calendar.",
      },
      source: {
        code: `<VcDatePicker v-model="value" label="Order date" :first-day-of-week="1" show-footer />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref<string | undefined>(undefined);
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDatePicker v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">ISO value: {{ value || "(none)" }}</div>
      </div>
    `,
  }),
};

export const Disabled: StoryType = {
  args: { label: "Order date", disabled: true },
  parameters: {
    docs: {
      description: {
        story: "Disabled state — input is non-interactive and the calendar trigger is also disabled.",
      },
      source: {
        code: `<VcDatePicker v-model="value" label="Order date" disabled />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `<VcDatePicker v-bind="args" v-model="value" />`,
  }),
};

export const WithExternalError: StoryType = {
  args: {
    label: "Order date",
    error: true,
    message: "Required field",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Simulates a vee-validate error: when `error` is `true`, the external `message` wins and the input's internal locale/range validation messaging is suppressed.",
      },
      source: {
        code: `<VcDatePicker v-model="value" label="Order date" :error="true" message="Required field" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref<string | undefined>(undefined);
      return { args, value };
    },
    template: `<VcDatePicker v-bind="args" v-model="value" />`,
  }),
};

export const Clearable: StoryType = {
  args: { label: "Order date", clearable: true },
  parameters: {
    docs: {
      description: {
        story:
          "Clear button appears in the input while there is text; clicking emits both `clear` and `update:modelValue(undefined)`. The calendar trigger remains available.",
      },
      source: {
        code: `<VcDatePicker v-model="value" label="Order date" clearable />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDatePicker v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">ISO value: {{ value || "(none)" }}</div>
      </div>
    `,
  }),
};

export const WithMask: StoryType = {
  args: { label: "Order date", mask: true },
  parameters: {
    docs: {
      description: {
        story:
          "`mask: true` enables a locale-aware input mask. Separators are auto-inserted as the user types digits. Paste of recognizable date formats (ISO or locale short) is intercepted and reformatted into the locale's display format.",
      },
      source: {
        code: `<VcDatePicker v-model="value" label="Order date" mask />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref<string | undefined>(undefined);
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDatePicker v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">ISO value: {{ value || "(none)" }}</div>
      </div>
    `,
  }),
};

export const LocaleJa: StoryType = {
  args: {
    label: "注文日",
    locale: "ja-JP",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Japanese locale: format from Intl + i18n labels via temporary global locale switch. Story registers `ja.json` and toggles `useI18n().locale` to `ja-JP` for demonstration — in production, locale messages are loaded at app startup.\n\nNote on i18n scope: this story temporarily switches vue-i18n's GLOBAL locale to ja-JP on mount (restoring on unmount). If Storybook autodocs renders this story alongside others, neighboring stories may briefly see the ja-JP locale during this story's lifecycle. Production code paths are unaffected — locale is normally controlled by the user-preferences layer.",
      },
      source: {
        code: `<!-- value ref starts empty -->\n<VcDatePicker v-model="value" label="注文日" locale="ja-JP" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref<string | undefined>(undefined);
      const i18n = useI18n();
      const previousLocale = i18n.locale.value;

      i18n.mergeLocaleMessage("ja-JP", jaMessages);

      onMounted(() => {
        i18n.locale.value = "ja-JP";
      });

      onUnmounted(() => {
        i18n.locale.value = previousLocale;
      });

      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDatePicker v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">ISO value: {{ value || "(none)" }}</div>
      </div>
    `,
  }),
};

export const SizeSm: StoryType = {
  args: { label: "Order date", size: "sm" },
  parameters: {
    docs: {
      source: {
        code: `<VcDatePicker v-model="value" label="Order date" size="sm" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `<VcDatePicker v-bind="args" v-model="value" />`,
  }),
};

export const SizeXs: StoryType = {
  args: { label: "Order date", size: "xs", weekdayFormat: "narrow" },
  parameters: {
    docs: {
      description: {
        story:
          '`size: xs` shrinks both the input and the embedded calendar to the compact 28px-cell scale. Pair with `weekday-format="narrow"` so the single-letter labels fit the cell width.',
      },
      source: {
        code: `<VcDatePicker v-model="value" label="Order date" size="xs" weekday-format="narrow" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `<VcDatePicker v-bind="args" v-model="value" />`,
  }),
};

export const CloseOnSelectFalse: StoryType = {
  args: { label: "Order date", closeOnSelect: false },
  parameters: {
    docs: {
      description: {
        story:
          "`closeOnSelect: false` — picking a date in the calendar commits the value but does NOT close the popover. Useful when consumers want to allow multi-step refinement (e.g. preview the choice in context before dismissing). Click outside or press Escape to close.",
      },
      source: {
        code: `<VcDatePicker v-model="value" label="Order date" :close-on-select="false" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDatePicker },
    setup() {
      const value = ref<string | undefined>(undefined);
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDatePicker v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">ISO value: {{ value || "(none)" }}</div>
      </div>
    `,
  }),
};
