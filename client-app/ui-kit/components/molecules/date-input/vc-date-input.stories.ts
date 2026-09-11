import { ref } from "vue";
import { VcDateInput } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md"];
const UPDATE_ON = ["blur", "enter"];

const meta: Meta<typeof VcDateInput> = {
  title: "Components/Molecules/VcDateInput",
  component: VcDateInput,
  parameters: {
    docs: {
      description: {
        component:
          "Text-based date input with locale-aware parsing, validation, and a smart placeholder hint derived from `Intl.DateTimeFormat`. The `mask` prop is an optional opt-in: when true, separators are auto-inserted as the user types digits, and paste of recognizable date formats (ISO, locale short) is intercepted and reformatted. Default is `mask: false` for backwards compatibility.",
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
    mask: {
      control: "boolean",
      description: "Apply a locale-aware input mask. Default: false.",
    },
    seamless: {
      control: "boolean",
      description:
        "Strip border, background, focus ring and fixed height so a parent shell can own the chrome. Pair with `hideDetails`.",
    },
    hideDetails: {
      control: "boolean",
      description: "Drop the details row so a parent shell can render one for a group of fields.",
    },
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Default: StoryType = {
  args: {},
  parameters: {
    docs: {
      source: {
        code: `<VcDateInput v-model="value" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateInput },
    setup() {
      const value = ref<string | undefined>(undefined);
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDateInput v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">ISO value: {{ value || "(none)" }}</div>
      </div>
    `,
  }),
};

export const WithLabel: StoryType = {
  args: { label: "Date" },
  parameters: {
    docs: {
      source: {
        code: `<VcDateInput v-model="value" label="Date" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateInput },
    setup() {
      const value = ref<string | undefined>(undefined);
      return { args, value };
    },
    template: `<VcDateInput v-bind="args" v-model="value" />`,
  }),
};

export const WithValue: StoryType = {
  args: { label: "Date" },
  parameters: {
    docs: {
      source: {
        code: `
          <!-- value ref starts at "2026-10-15" -->
          <VcDateInput v-model="value" label="Date" />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcDateInput },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDateInput v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">ISO value: {{ value || "(none)" }}</div>
      </div>
    `,
  }),
};

export const WithMinMax: StoryType = {
  args: {
    label: "Date",
    min: "2026-10-05",
    max: "2026-10-25",
    message: "Pick a date between 2026-10-05 and 2026-10-25",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Typing a date outside the range surfaces an inline validation error via VcInput's `message`. The dirty text is kept until the user corrects it.",
      },
      source: {
        code: `
          <VcDateInput
            v-model="value"
            label="Date"
            min="2026-10-05"
            max="2026-10-25"
          />
        `,
      },
    },
  },
  render: (args) => ({
    components: { VcDateInput },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDateInput v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">ISO value: {{ value || "(none)" }}</div>
      </div>
    `,
  }),
};

export const WithExternalError: StoryType = {
  args: {
    label: "Date",
    error: true,
    message: "Required field",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Simulates a vee-validate error: when `error` is `true`, the external `message` wins and the internal locale/range validation messaging is suppressed.",
      },
      source: {
        code: `<VcDateInput v-model="value" label="Date" :error="true" message="Required field" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateInput },
    setup() {
      const value = ref<string | undefined>(undefined);
      return { args, value };
    },
    template: `<VcDateInput v-bind="args" v-model="value" />`,
  }),
};

export const Disabled: StoryType = {
  args: { label: "Date", disabled: true },
  parameters: {
    docs: {
      source: {
        code: `<VcDateInput v-model="value" label="Date" disabled />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateInput },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `<VcDateInput v-bind="args" v-model="value" />`,
  }),
};

export const Readonly: StoryType = {
  args: { label: "Date", readonly: true },
  parameters: {
    docs: {
      source: {
        code: `<VcDateInput v-model="value" label="Date" readonly />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateInput },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `<VcDateInput v-bind="args" v-model="value" />`,
  }),
};

export const Required: StoryType = {
  args: { label: "Date", required: true },
  parameters: {
    docs: {
      description: {
        story: "Required label indicator (red asterisk) rendered by VcLabel.",
      },
      source: {
        code: `<VcDateInput v-model="value" label="Date" required />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateInput },
    setup() {
      const value = ref<string | undefined>(undefined);
      return { args, value };
    },
    template: `<VcDateInput v-bind="args" v-model="value" />`,
  }),
};

export const Clearable: StoryType = {
  args: { label: "Date", clearable: true },
  parameters: {
    docs: {
      description: {
        story:
          "Clear button appears while there is text; clicking emits both `clear` and `update:modelValue(undefined)`.",
      },
      source: {
        code: `<VcDateInput v-model="value" label="Date" clearable />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateInput },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDateInput v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">ISO value: {{ value || "(none)" }}</div>
      </div>
    `,
  }),
};

export const UpdateOnEnter: StoryType = {
  args: { label: "Date", updateOn: "enter" },
  parameters: {
    docs: {
      description: {
        story:
          '`updateOn: "enter"` — blur does NOT commit. Press Enter to commit. Useful when the parent wants to control when input is consumed.',
      },
      source: {
        code: `<VcDateInput v-model="value" label="Date" update-on="enter" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateInput },
    setup() {
      const value = ref<string | undefined>(undefined);
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDateInput v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">ISO value: {{ value || "(none)" }}</div>
      </div>
    `,
  }),
};

export const LocaleRu: StoryType = {
  args: { label: "Дата заказа", locale: "ru-RU" },
  parameters: {
    docs: {
      description: {
        story: "Russian locale: placeholder renders as `DD.MM.YYYY`.",
      },
      source: {
        code: `<VcDateInput v-model="value" label="Дата заказа" locale="ru-RU" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateInput },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `<VcDateInput v-bind="args" v-model="value" />`,
  }),
};

export const LocaleJa: StoryType = {
  args: { label: "日付", locale: "ja-JP" },
  parameters: {
    docs: {
      description: {
        story: "Japanese locale: placeholder renders as `YYYY/MM/DD`.",
      },
      source: {
        code: `<VcDateInput v-model="value" label="日付" locale="ja-JP" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateInput },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `<VcDateInput v-bind="args" v-model="value" />`,
  }),
};

export const LocaleEnUs: StoryType = {
  args: { label: "Date", locale: "en-US" },
  parameters: {
    docs: {
      description: {
        story: "US English locale: placeholder renders as `MM/DD/YYYY`.",
      },
      source: {
        code: `<VcDateInput v-model="value" label="Date" locale="en-US" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateInput },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `<VcDateInput v-bind="args" v-model="value" />`,
  }),
};

export const SizeSm: StoryType = {
  args: { label: "Date", size: "sm" },
  parameters: {
    docs: {
      source: {
        code: `<VcDateInput v-model="value" label="Date" size="sm" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateInput },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `<VcDateInput v-bind="args" v-model="value" />`,
  }),
};

export const SizeXs: StoryType = {
  args: { label: "Date", size: "xs" },
  parameters: {
    docs: {
      source: {
        code: `<VcDateInput v-model="value" label="Date" size="xs" />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateInput },
    setup() {
      const value = ref<string | undefined>("2026-10-15");
      return { args, value };
    },
    template: `<VcDateInput v-bind="args" v-model="value" />`,
  }),
};

export const WithMask: StoryType = {
  args: { label: "Date", mask: true },
  parameters: {
    docs: {
      description: {
        story:
          "With `mask: true`, separators are auto-inserted as the user types digits. The mask pattern is locale-aware — for the active i18n locale here. Paste of recognizable date formats (try pasting `2026-10-15`) is intercepted and reformatted into the locale's display format. Paste of free-form text is subject to mask transformation (digits flow into mask slots).",
      },
      source: {
        code: `<VcDateInput v-model="value" label="Date" mask />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateInput },
    setup() {
      const value = ref<string | undefined>(undefined);
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDateInput v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">ISO value: {{ value || "(none)" }}</div>
      </div>
    `,
  }),
};

export const WithMaskLocaleJa: StoryType = {
  args: { label: "日付", locale: "ja-JP", mask: true },
  parameters: {
    docs: {
      description: {
        story:
          "Mask + Japanese locale. The mask pattern follows the locale: ja-JP yields `####/##/##` (year first). Try typing `20261015` to see the separators auto-insert at year boundary and between month/day. Paste of ISO `2026-10-15` is intercepted by useDateField and reformatted to `2026/10/15`.",
      },
      source: {
        code: `<VcDateInput v-model="value" label="日付" locale="ja-JP" mask />`,
      },
    },
  },
  render: (args) => ({
    components: { VcDateInput },
    setup() {
      const value = ref<string | undefined>(undefined);
      return { args, value };
    },
    template: `
      <div class="space-y-2">
        <VcDateInput v-bind="args" v-model="value" />
        <div class="text-sm text-neutral-600">ISO value: {{ value || "(none)" }}</div>
      </div>
    `,
  }),
};
