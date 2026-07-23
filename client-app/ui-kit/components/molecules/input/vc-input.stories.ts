import { VcInput, VcButton, VcAlert } from "..";
import { VcMarkdownRender } from "../../atoms";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md", "auto"];
const TYPES = ["text", "password", "number"];
const ALIGNS = ["start", "center", "end"];

const meta: Meta = {
  title: "Components/Molecules/VcInput",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: VcInput as any,
  parameters: {
    docs: {
      description: {
        component:
          "The base text-input building block of the UI-Kit. Renders a label, the input itself (with prepend/append slots), and a details row (message/counter/error) with matching `aria-describedby` wiring. Higher-level fields compose it rather than reimplementing it — `VcDateInput` wraps it directly, and `VcDateRangeInput` embeds two `seamless` `VcInput` segments inside one shared bordered shell. See the Seamless story for that composition pattern.",
      },
    },
  },
  argTypes: {
    /**
     * Docs:
     *  https://storybook.js.org/docs/vue/essentials/controls#annotation
     *  https://storybook.js.org/docs/vue/api/argtypes#manual-specification
     */
    type: {
      control: "radio",
      options: TYPES,
      description:
        "Input type. Deprecated value: `date` — use VcDatePicker (typed date entry with calendar popover) or VcDateInput (input-only) instead.",
      table: { type: { summary: TYPES.join(" | ") } },
    },
    size: {
      control: "radio",
      options: SIZES,
      type: { name: "string", required: false },
      description: "`auto` applies no fixed height class — the field sizes to its content instead of a fixed row.",
      table: {
        type: {
          summary: SIZES.join(" | "),
        },
      },
    },
    align: {
      control: "inline-radio",
      options: ALIGNS,
      description:
        "Logical text alignment (RTL-safe: `end` renders right in LTR, left in RTL). Use `center` for composed segments (e.g. date parts) and `end` for numeric/currency values. Overlaps with the deprecated `center` prop — if both are set, `align` wins because its CSS rule comes later in the stylesheet.",
      table: { type: { summary: ALIGNS.join(" | ") }, defaultValue: { summary: "start" } },
    },
    seamless: {
      control: "boolean",
      description:
        "Strips border, background, focus ring, and fixed height — a composition primitive for embedding this input inside a parent-owned bordered shell (see VcDateRangeInput). Does NOT hide the details row; pair with `hide-details` for that. Looks broken if used bare on a page — see the Seamless story.",
    },
    hideDetails: {
      control: "boolean",
      description:
        "Removes the details row entirely, including its `aria-describedby` association — `message`/`counter` are silently ignored, not just visually hidden. Only pair with a parent that owns its own error display and description association, as VcDateRangeInput does.",
    },
    noBorder: {
      control: "boolean",
      description:
        "Removes only the border; background, height, ring, and padding stay intact. Lighter than `seamless`, which additionally strips background, ring, height, and padding for parent-shell composition.",
    },
    readonly: {
      control: "boolean",
      description:
        "Value is fixed but the input stays focusable, tabbable, and announced by assistive tech — unlike `disabled`, which removes it from the tab order and accessibility tree entirely.",
    },
    truncate: {
      control: "boolean",
      description:
        "Truncates overflowing text with an ellipsis instead of wrapping. Only visible when narrower than its content.",
    },
    center: {
      control: false,
      description: 'DEPRECATED: use `align="center"` instead.',
      table: {
        category: "Deprecated",
        type: { summary: "boolean" },
      },
    },
    min: { table: { type: { summary: "string|number" } } },
    max: { table: { type: { summary: "string|number" } } },
    step: { table: { type: { summary: "string|number" } } },
    minlength: { table: { type: { summary: "string|number" } } },
    maxlength: { table: { type: { summary: "string|number" } } },
    counter: {
      control: "boolean",
      description: "Shows a character counter below the input",
    },
    modelValue: { table: { type: { summary: "string|number" } } },
  },
  args: {
    readonly: false,
    disabled: false,
    required: false,
    noBorder: false,
    center: false,
    hidePasswordSwitcher: false,
    error: false,
    counter: false,
    showEmptyDetails: false,
    type: "text",
    size: "md",
    align: "start",
    seamless: false,
    hideDetails: false,
    truncate: false,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcInput v-bind="args" v-model="args.modelValue" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const commonArgs = {
  label: "Label",
  placeholder: "Placeholder",
  message: "Hint message",
};

export const Basic: StoryType = {
  args: {
    ariaLabel: "Input field",
  },
  parameters: {
    docs: {
      description: {
        story: "Minimum usage — no label, ARIA label only.",
      },
      source: {
        code: `<VcInput aria-label="Input field" />`,
      },
    },
  },
};

export const Common: StoryType = {
  args: commonArgs,
  parameters: {
    docs: {
      description: {
        story: "Typical labeled field: label, placeholder, and a hint message rendered in the details row.",
      },
      source: {
        code: `<VcInput label="Label" placeholder="Placeholder" message="Hint message" />`,
      },
    },
  },
};

export const Required: StoryType = {
  args: {
    ...commonArgs,
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Adds the required indicator (red asterisk) rendered by VcLabel. Purely visual — enforce the actual requirement with vee-validate/your form schema.",
      },
      source: {
        code: `<VcInput label="Label" placeholder="Placeholder" message="Hint message" required />`,
      },
    },
  },
};

export const ErrorState: StoryType = {
  args: {
    ...commonArgs,
    required: true,
    error: true,
    message: "Error message",
  },
  parameters: {
    docs: {
      description: {
        story:
          "`error` swaps the accent color and border to danger; pass the validation text through the same `message` prop — there is no separate error-message prop.",
      },
      source: {
        code: `<VcInput label="Label" required error message="Error message" />`,
      },
    },
  },
};

export const TypePassword: StoryType = {
  args: {
    ...commonArgs,
    autocomplete: "current-password",
    type: "password",
  },
  parameters: {
    docs: {
      description: {
        story:
          '`type="password"` adds a built-in show/hide toggle button. Set `hide-password-switcher` to remove it if you render your own.',
      },
      source: {
        code: `<VcInput label="Label" type="password" autocomplete="current-password" />`,
      },
    },
  },
};

export const Clearable: StoryType = {
  args: {
    ...commonArgs,
    clearable: true,
    modelValue: "Sample text",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pre-filled here so the clear button is visible immediately — it only appears once there is a value, and is hidden entirely (not just disabled) when the field is `disabled` or `readonly`. Clicking it resets the model to `undefined` and emits `clear`.",
      },
      source: {
        code: `<VcInput label="Label" clearable v-model="value" />`,
      },
    },
  },
};

export const Disabled: StoryType = {
  render: () => ({
    components: { VcInput, VcButton },
    template: `<div class="space-y-6">
      <div>
        <div class="mb-2 text-sm font-medium text-neutral-700">Bare disabled</div>
        <VcInput label="Label" placeholder="Placeholder" message="Hint message" disabled />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="mb-2 text-sm font-medium text-neutral-700">Misuse — button stays fully clickable</div>
          <VcInput label="Label" disabled model-value="Value">
            <template #append>
              <VcButton>Action</VcButton>
            </template>
          </VcInput>
        </div>
        <div>
          <div class="mb-2 text-sm font-medium text-neutral-700">Correct usage — :disabled passed to slot content</div>
          <VcInput label="Label" disabled model-value="Value">
            <template #append>
              <VcButton :disabled="true">Action</VcButton>
            </template>
          </VcInput>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="mb-2 text-sm font-medium text-neutral-700">Disabled + clearable (× hidden entirely)</div>
          <VcInput label="Label" disabled clearable model-value="Sample text" />
        </div>
        <div>
          <div class="mb-2 text-sm font-medium text-neutral-700">Readonly + clearable, for contrast (× also hidden)</div>
          <VcInput label="Label" readonly clearable model-value="Sample text" />
        </div>
      </div>
    </div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Disabled removes the field from the tab order and accessibility tree — contrast with Readonly, which keeps it focusable and announced but not editable. Slot content is NOT automatically disabled: VcInput only disables its own input element, its own clear button, and its own password toggle — a button you place in `#append`/`#prepend` stays fully interactive unless you bind `:disabled` on it yourself (confirmed in vc-input.vue: `disabled` is never passed into the slot), as the misuse/correct-usage pair shows. The clear button IS controlled by VcInput itself, though — it's hidden entirely, not just disabled, whenever `disabled` or `readonly` is true (bottom row, both states).",
      },
      source: {
        code: `
          <!-- WRONG: the button stays clickable even though the input is disabled -->
          <VcInput label="Label" disabled>
            <template #append>
              <VcButton>Action</VcButton>
            </template>
          </VcInput>

          <!-- RIGHT: bind disabled on the slotted control yourself -->
          <VcInput label="Label" :disabled="isDisabled">
            <template #append>
              <VcButton :disabled="isDisabled">Action</VcButton>
            </template>
          </VcInput>
        `,
      },
    },
  },
};

export const Readonly: StoryType = {
  args: {
    ...commonArgs,
    readonly: true,
    modelValue: "Read-only value",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Value is fixed but the input stays focusable, tabbable, and announced by assistive tech — unlike `disabled`, which drops it from the tab order and accessibility tree entirely. Use `readonly` when the value needs to remain selectable/copyable.",
      },
      source: {
        code: `<VcInput label="Label" readonly model-value="Read-only value" />`,
      },
    },
  },
};

export const Align: StoryType = {
  render: () => ({
    components: { VcInput },
    template: `<div class="space-y-4">
      <VcInput label="start (default)" align="start" model-value="123.45" />
      <VcInput label="center" align="center" model-value="123.45" />
      <VcInput label="end" align="end" model-value="123.45" />
    </div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Logical alignment, RTL-safe (`end` renders right in LTR, left in RTL — never hard-code `text-right`/`text-left` on top of this). Use `center` when composing multiple segments into one field (e.g. VcDateRangeInput's date parts) and `end` for numeric/currency values. Supersedes the deprecated `center` boolean.",
      },
      source: {
        code: `<VcInput label="Quantity" align="end" v-model="value" />`,
      },
    },
  },
};

export const Seamless: StoryType = {
  render: () => ({
    components: { VcInput },
    template: `<div class="space-y-6">
      <div>
        <div class="mb-2 text-sm font-medium text-neutral-700">Misuse — seamless alone on a bare page</div>
        <VcInput seamless placeholder="No visible border, background, or focus ring" />
      </div>

      <div>
        <div class="mb-2 text-sm font-medium text-neutral-700">Correct usage — composed inside one shared shell</div>
        <div class="flex h-11 items-center rounded-lg border border-neutral-400 bg-additional-50 p-0.5">
          <VcInput seamless align="center" hide-details placeholder="Start" class="flex-1" />
          <span class="px-1 text-neutral-400" aria-hidden="true">–</span>
          <VcInput seamless align="center" hide-details placeholder="End" class="flex-1" />
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div>
          <div class="mb-2 text-sm font-medium text-neutral-700">seamless + message (details row stays)</div>
          <div class="rounded-lg border border-neutral-400 bg-additional-50 p-0.5">
            <VcInput
              seamless
              aria-label="Segment"
              placeholder="Segment"
              message="Still renders — seamless only strips container chrome"
            />
          </div>
        </div>
        <div>
          <div class="mb-2 text-sm font-medium text-neutral-700">seamless + counter (also stays)</div>
          <div class="rounded-lg border border-neutral-400 bg-additional-50 p-0.5">
            <VcInput seamless counter aria-label="Segment" :maxlength="20" model-value="Segment" />
          </div>
        </div>
        <div>
          <div class="mb-2 text-sm font-medium text-neutral-700">seamless hide-details (chrome-free)</div>
          <div class="rounded-lg border border-neutral-400 bg-additional-50 p-0.5">
            <VcInput seamless hide-details placeholder="Segment" message="Never rendered" />
          </div>
        </div>
      </div>
    </div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`seamless` strips border, background, focus ring, and fixed height — it is a composition primitive, not a standalone style, so it looks broken used bare on a page (top example). The real use case is embedding one or more segments inside a single parent-owned bordered shell that supplies the chrome instead — see VcDateRangeInput, which renders two `seamless align="center" hide-details` segments inside one shared shell. The `message`/`counter` row is an independent concern from the chrome: `seamless` alone still renders it for both `message` (bottom-left) and `counter` (bottom-center) — only pair it with `hide-details` (bottom-right) when the parent owns error display and description association itself.',
      },
      source: {
        code: `<div class="flex h-11 items-center rounded-lg border border-neutral-400 bg-additional-50 p-0.5">
  <VcInput seamless align="center" hide-details v-model="range.start" class="flex-1" />
  <span aria-hidden="true">–</span>
  <VcInput seamless align="center" hide-details v-model="range.end" class="flex-1" />
</div>`,
      },
    },
  },
};

export const HideDetails: StoryType = {
  render: () => ({
    components: { VcInput },
    template: `<div class="grid grid-cols-2 gap-4">
      <VcInput label="Default" message="This is announced via aria-describedby" />
      <VcInput label="hide-details" hide-details message="This never renders and is never associated" />
    </div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "`hide-details` removes the whole details row, including its `aria-describedby` association — `message`/`counter` are silently ignored rather than just visually hidden. Only combine it with a parent that renders and associates its own error/description text, as VcDateRangeInput does for its two segments.",
      },
      source: {
        code: `<VcInput label="Amount" hide-details message="Owned by the parent instead" />`,
      },
    },
  },
};

export const NoBorder: StoryType = {
  args: {
    ...commonArgs,
    noBorder: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "`no-border` removes only the border — background, height, focus ring, and padding stay intact, so the field still looks and behaves like a normal standalone input. Compare to `seamless`, which additionally strips background, ring, height, and padding for embedding inside a parent shell (see the Seamless story).",
      },
      source: {
        code: `<VcInput label="Label" no-border />`,
      },
    },
  },
};

export const Sizes: StoryType = {
  render: () => ({
    components: { VcInput },
    template: `<div class="space-y-4">
      <VcInput label="xs" size="xs" placeholder="Size xs" />
      <VcInput label="sm" size="sm" placeholder="Size sm" />
      <VcInput label="md" size="md" placeholder="Size md" />
      <VcInput label="auto" size="auto" placeholder="Size auto" />
    </div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "`xs`/`sm`/`md` set a fixed container height and text size. `auto` applies none of them — the field sizes to its content/line-height instead of a fixed row, useful when a parent layout already controls row height itself.",
      },
      source: {
        code: `<VcInput label="Label" size="sm" />`,
      },
    },
  },
};

export const Mask: StoryType = {
  args: {
    label: "Phone number",
    placeholder: "(555) 123-4567",
    modelValue: "5551234567",
    mask: "(###) ###-####",
  },
  parameters: {
    docs: {
      description: {
        story:
          "`mask` accepts either a maska pattern string (`#` = digit token, other characters are literal) or a full `MaskOptions` object for advanced cases like custom tokens or eager mode — see `bank-card-form.vue`'s `{ mask: \"#### #### #### #### ###\" }` for a real object-form example. This is raw, locale-unaware masking. For date input, use VcDateInput's own `mask: boolean` prop instead — it is locale-aware and paste-safe; do not hand-roll a date pattern here.",
      },
      source: {
        code: `
          <!-- phone ref starts at "5551234567" — maska reformats it to "(555) 123-4567" on mount -->
          <VcInput label="Phone number" mask="(###) ###-####" v-model="phone" />
        `,
      },
    },
  },
};

export const Truncate: StoryType = {
  args: {
    label: "Truncate",
    modelValue: "A very long value that will not fit and gets cut off with an ellipsis",
    truncate: true,
  },
  render: (args) => ({
    components: { VcInput },
    setup: () => ({ args }),
    template: `<div class="max-w-[12rem]"><VcInput v-bind="args" v-model="args.modelValue" /></div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Truncates overflowing text with an ellipsis instead of wrapping or scrolling horizontally — only visible when the field is narrower than its content, as forced here with a `max-w-[12rem]` wrapper.",
      },
      source: {
        code: `<VcInput label="Truncate" truncate model-value="A very long value that will not fit and gets cut off with an ellipsis" />`,
      },
    },
  },
};

export const WithButton: StoryType = {
  args: commonArgs,
  render: (args) => ({
    components: { VcInput, VcButton },
    setup: () => ({ args }),
    template: `<VcInput v-bind="args" v-model="args.modelValue">
      <template #append>
        <VcButton truncate>Add to cart</VcButton>
      </template>
    </VcInput>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "The `append` slot receives `{ focusInput }` so a custom control can return focus to the input after acting.",
      },
    },
  },
};

export const WithCounter: StoryType = {
  args: {
    label: "Label",
    placeholder: "Placeholder",
    counter: true,
    maxlength: 30,
  },
  parameters: {
    docs: {
      description: {
        story:
          "`counter` renders a character count in the details row; pair with `maxlength` to show it as `current/max`.",
      },
      source: {
        code: `<VcInput label="Label" counter :maxlength="30" />`,
      },
    },
  },
};

export const WithMessageAndCounter: StoryType = {
  args: {
    ...commonArgs,
    counter: true,
    maxlength: 30,
  },
  parameters: {
    docs: {
      description: {
        story: "`message` and `counter` can render together in the same details row.",
      },
      source: {
        code: `<VcInput label="Label" message="Hint message" counter :maxlength="30" />`,
      },
    },
  },
};

const DATE_TYPE_DEPRECATION =
  '`type="date"` is deprecated — use **VcDatePicker** (calendar popover) or **VcDateInput** (input-only) instead. It still renders for backward compatibility and emits a one-time dev console warning.';

const CENTER_DEPRECATION =
  '`center` is deprecated — use `align="center"` instead. Both still work, but if both are set, `align` wins: its CSS rule comes later in the stylesheet and overrides `center` when they disagree.';

export const Deprecations: StoryType = {
  tags: ["deprecated"],
  parameters: {
    docs: {
      description: {
        story: DATE_TYPE_DEPRECATION,
      },
    },
  },
  render: () => ({
    components: { VcInput, VcAlert, VcMarkdownRender },
    setup: () => ({ dateMessage: DATE_TYPE_DEPRECATION, centerMessage: CENTER_DEPRECATION }),
    template: `<div class="space-y-3">
      <VcAlert color="warning" variant="outline" icon title="Deprecated">
        <VcMarkdownRender :src="dateMessage" />
      </VcAlert>
      <VcInput type="date" label="Date input (deprecated)" />

      <VcAlert color="warning" variant="outline" icon title="Deprecated">
        <VcMarkdownRender :src="centerMessage" />
      </VcAlert>
      <VcInput label="Legacy center prop (still works)" center placeholder="Centered text" />
    </div>`,
  }),
};
