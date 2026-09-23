<template>
  <div
    :class="[
      'vc-input',
      `vc-input--size--${size}`,
      {
        'vc-input--readonly': readonly,
        'vc-input--disabled': disabled,
        'vc-input--error': error,
        'vc-input--no-border': noBorder,
        'vc-input--seamless': seamless,
        'vc-input--center': center,
        'vc-input--truncate': truncate,
      },
    ]"
    v-bind="attrs"
  >
    <!-- The label is pinned to the smallest step rather than following the field's size: a
         field's label is a caption over the value, and at the field's own size the two competed
         for the same read. The size prop is still there for a consumer that wants otherwise. -->
    <VcLabel v-if="label" :for-id="componentId" :required="required" :error="error" size="xs">
      {{ label }}
    </VcLabel>

    <div class="vc-input__container">
      <div v-if="$slots.prepend" class="vc-input__decorator">
        <slot name="prepend" :focus-input="focusInput" />
      </div>

      <input
        :id="componentId"
        ref="inputElement"
        v-model="model"
        v-bind="{ ...listeners, ...aria }"
        v-maska="mask"
        :type="inputType"
        :name="name"
        :placeholder="placeholder"
        :readonly="readonly"
        :disabled="disabled"
        :min="minValue"
        :max="maxValue"
        :minlength="minlength"
        :maxlength="maxlength"
        :step="stepValue"
        :autocomplete="computedAutocomplete"
        :aria-label="ariaLabel ?? label"
        :aria-describedby="describedById"
        :aria-invalid="invalid"
        :title="browserTooltip === 'enabled' ? message : ''"
        class="vc-input__input"
        :tabindex="tabindex"
        :data-test-id="testIdInput"
        @keydown="keyDown($event)"
        @click.stop="inputClick"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />

      <div v-if="clearable && model && !disabled && !readonly" class="vc-input__decorator">
        <VcButton
          :disabled="disabled"
          :aria-label="$t('ui_kit.buttons.clear')"
          type="button"
          icon="delete-thin"
          color="neutral"
          variant="ghost"
          class="vc-input__clear"
          :icon-size="getInputClearIconSize(size)"
          @keydown.enter.stop.prevent
          @keyup.enter.stop.prevent="clear"
          @click.stop="clear"
        />
      </div>

      <div v-if="type === 'password' && !hidePasswordSwitcher" class="vc-input__decorator">
        <VcButton
          :disabled="disabled"
          :aria-label="$t('ui_kit.buttons.show_hide_password')"
          type="button"
          :icon="passwordVisibilityIcon"
          variant="surface"
          :icon-size="size === 'md' ? '1.5rem' : '1.25rem'"
          class="vc-input__password-button"
          @click="togglePasswordVisibility"
        />
      </div>

      <div v-if="$slots.append" class="vc-input__decorator">
        <slot name="append" :focus-input="focusInput" />
      </div>
    </div>

    <VcInputDetails
      v-if="!hideDetails"
      :id="counter || message ? detailsId : undefined"
      :show-empty="showEmptyDetails"
      :counter="counter"
      :message="message"
      :error="error"
      :text-length="textLength"
      :max-length="maxlength"
      :single-line="singleLineMessage"
    />
  </div>
</template>

<script setup lang="ts" generic="T extends string | number | null">
import { vMaska } from "maska/vue";
import { provide, computed, ref, useTemplateRef } from "vue";
import { useAttrsOnly, useComponentId, useListeners } from "@/ui-kit/composables";
import { getInputClearIconSize } from "@/ui-kit/utilities";
import type { MaskOptions } from "maska";
import type { AriaAttributes } from "vue";

export interface IProps {
  modelModifiers?: Record<string, boolean>;
  autocomplete?: string;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  ariaLabel?: string;
  label?: string;
  placeholder?: string;
  message?: string;
  singleLineMessage?: boolean;
  /** Visual error state. Also exposes `aria-invalid`, unless `aria["aria-invalid"]` overrides it. */
  error?: boolean;
  noBorder?: boolean;
  seamless?: boolean;
  hidePasswordSwitcher?: boolean;
  showEmptyDetails?: boolean;
  hideDetails?: boolean;
  counter?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  minlength?: string | number;
  maxlength?: string | number;
  center?: boolean;
  truncate?: boolean;
  type?:
    | "text"
    | "password"
    | "number"
    | "email"
    | "search"
    /** @deprecated Use VcDatePicker (or VcDateInput for input-only) instead. */
    | "date";
  size?: VcInputSizeType;
  clearable?: boolean;
  browserTooltip?: "enabled" | "disabled";
  selectOnClick?: boolean;
  testIdInput?: string;
  aria?: Record<string, string | number | null>;
  disableAutocomplete?: boolean;
  tabindex?: string | number;
  mask?: string | MaskOptions;
}

defineOptions({
  inheritAttrs: false,
});

const emit = defineEmits<{
  (event: "clear"): void;
  (event: "blur", blurEvent: FocusEvent): void;
  (event: "focus", focusEvent: FocusEvent): void;
}>();

const props = withDefaults(defineProps<IProps>(), {
  type: "text",
  size: "md",
  browserTooltip: "disabled",
  tabindex: 0,
  hideDetails: false,
  seamless: false,
});

if (import.meta.env.DEV && props.type === "date") {
  // eslint-disable-next-line no-console
  console.warn('VcInput: type="date" is deprecated. Use VcDatePicker (or VcDateInput for input-only) instead.');
}

const LIMITED_TYPES: IProps["type"][] = ["number", "date"];

const componentId = useComponentId("input");
const detailsId = componentId + "-details";
const listeners = useListeners();
const attrs = useAttrsOnly();

// mergeProps assigns unconditionally, so this later binding would erase a forwarded aria-describedby.
const describedById = computed<string | undefined>(() => {
  const forwarded = props.aria?.["aria-describedby"];
  const forwardedId = typeof forwarded === "string" ? forwarded : undefined;
  const ownId = !props.hideDetails && (props.counter || props.message) ? detailsId : undefined;
  return [ownId, forwardedId].filter(Boolean).join(" ") || undefined;
});

// Per ARIA an empty aria-invalid means NOT invalid, so treat it as no override; any other
// unrecognised token means "true".
const invalid = computed<AriaAttributes["aria-invalid"]>(() => {
  const override = props.aria?.["aria-invalid"];

  if (override == null || override === "") {
    return props.error ? "true" : undefined;
  }

  return override === "false" || override === "grammar" || override === "spelling" ? override : "true";
});

const computedAutocomplete = computed(() => {
  if (props.disableAutocomplete) {
    return "none";
  }

  return props.autocomplete;
});

const inputElement = useTemplateRef("inputElement");
const inputType = computed(() => (props.type === "password" && isPasswordVisible.value ? "text" : props.type));

defineExpose({ inputElement });

const model = defineModel<T>({
  set(value) {
    if (props.disabled) {
      return;
    }

    return !(props.type === "number" && value === "") ? value : undefined;
  },
});

const textLength = computed(() => String(model.value ?? "").length);

const _size = computed(() => props.size);

const minValue = computed(() => (LIMITED_TYPES.includes(props.type) ? props.min : undefined));
const maxValue = computed(() => (LIMITED_TYPES.includes(props.type) ? props.max : undefined));
const stepValue = computed(() => (props.type === "number" ? props.step : undefined));

const isPasswordVisible = ref<boolean>(false);
const passwordVisibilityIcon = computed<string>(() => (isPasswordVisible.value ? "eye-off" : "eye"));

function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value;
  focusInput();
}

function focusInput() {
  if (inputElement.value) {
    inputElement.value.focus();
    setTimeout(() => {
      if (inputElement.value?.type !== "date") {
        const len = inputElement.value?.value.length ?? 0;
        inputElement.value?.setSelectionRange(len, len);
      }
    }, 0);
  }
}

function clear() {
  model.value = undefined;
  focusInput();
  emit("clear");
}

// Workaround to fix Safari bug
function keyDown(event: KeyboardEvent) {
  if (props.type === "number") {
    const allowedCharacter = /(^\d*$)|(Backspace|Tab|Delete|ArrowLeft|ArrowRight|ArrowUp|ArrowDown)/;
    if (!allowedCharacter.test(event.key)) {
      event.preventDefault();
    }
  }
}

function inputClick() {
  if (inputElement.value && props.selectOnClick) {
    inputElement.value.select();
  }
}

provide<VcInputContextType>("inputContext", {
  size: _size,
});
</script>

<style lang="scss">
@use "@/ui-kit/styles/focus-ring" as *;

.vc-input {
  $sizeXs: "";
  $sizeSm: "";
  $sizeMd: "";

  $readonly: "";
  $disabled: "";
  $error: "";
  $noBorder: "";
  $seamless: "";
  $center: "";
  $truncate: "";

  --color: var(--vc-input-base-color, theme("colors.primary.500"));

  // Muted, so the caption gives way to the value under it. Declared here rather than in
  // VcLabel's own default, which standalone labels — and the ones over a select or a
  // textarea — keep at the darkest step.
  --vc-label-color: var(--vc-input-label-color, theme("colors.neutral.700"));

  --radius: var(--vc-input-radius, var(--vc-radius, 0.5rem));
  --vc-button-radius: calc(var(--radius) - 2px);

  @apply flex flex-col;

  &--size {
    &--xs {
      $sizeXs: &;
    }

    &--sm {
      $sizeSm: &;
    }

    &--md {
      $sizeMd: &;
    }
  }

  &--readonly {
    $readonly: &;
  }

  &--disabled {
    $disabled: &;
  }

  &--error {
    $error: &;

    --color: var(--vc-input-error-color, theme("colors.danger.500"));
  }

  &--no-border {
    $noBorder: &;
  }

  &--seamless {
    $seamless: &;
  }

  &--center {
    $center: &;
  }

  &--truncate {
    $truncate: &;
  }

  &__container {
    // The field's surface, exposed so a theme can sit it on a translucent plate instead of an
    // opaque one. Defaults are the values this rule has always carried.
    --container-bg-color: var(--vc-input-bg-color, theme("colors.additional.50"));
    --container-border-color: var(--vc-input-border-color, theme("colors.neutral.400"));

    @apply flex items-stretch p-0.5 border border-[--container-border-color] rounded-[--radius] bg-[--container-bg-color] select-none;

    // Height is per size, and so is the override: a theme that wants one size taller must not
    // silently resize the other three. Each default is that size's own long-standing height.
    #{$sizeXs} & {
      @apply text-sm;

      height: var(--vc-input-height, theme("height.8"));
    }

    #{$sizeSm} & {
      @apply text-base;

      height: var(--vc-input-height, 2.375rem);
    }

    #{$sizeMd} & {
      @apply text-base;

      height: var(--vc-input-height, theme("height.11"));
    }

    &:has(input:focus-visible) {
      @include focus-ring;
    }

    #{$error} & {
      @apply border-[--color] text-[--color];
    }

    #{$disabled} &,
    &:has(input:disabled) {
      @apply bg-neutral-50 cursor-not-allowed;
    }

    #{$noBorder} & {
      @apply border-none;
    }

    #{$seamless} & {
      @apply border-0 bg-transparent p-0;

      // Mirrors the container's own focus rule: #2468 made it an outline, and ring-0 cancels box-shadow.
      &:has(input:focus-visible) {
        @apply outline-none;
      }

      // Outspecifies the disabled fill above: :has() lands at (0,2,1), a bare seamless rule at (0,2,0).
      &:has(input:disabled) {
        @apply bg-transparent;
      }
    }

    #{$seamless}#{$sizeXs} &,
    #{$seamless}#{$sizeSm} &,
    #{$seamless}#{$sizeMd} & {
      height: auto;
    }
  }

  &__decorator {
    @apply flex-none flex items-center max-w-[50%] h-full;

    #{$disabled} &,
    &:disabled {
      @apply cursor-not-allowed;
    }
  }

  &__input {
    @apply relative m-px bg-transparent rounded-[3px] leading-none w-full min-w-0 appearance-none font-normal;

    padding-inline: var(--vc-input-padding-x, theme("padding.2"));

    &::-webkit-search-cancel-button {
      @apply appearance-none;
    }

    &::-webkit-calendar-picker-indicator {
      @apply hidden;
    }

    &::-moz-calendar-picker-indicator {
      @apply hidden;
    }

    &[type="date"] {
      @apply -me-8;

      clip-path: inset(0 2rem 0 0);
    }

    &:focus {
      @apply outline-none;
    }

    #{$disabled} &,
    &:disabled {
      @apply text-neutral-500 cursor-not-allowed;
    }

    &:autofill {
      // Chrome paints the autofilled row itself, and a 1000px inset shadow is the only way to
      // repaint it — but that shadow lands on THIS box, whose 3px corners cut straight across
      // the container's curve. On a pill the fill spilled past the border at both ends and left
      // the outline stranded outside it. So the fill takes the container's radius, less the 4px
      // this box is inset by (1px margin + the container's 2px padding + its 1px border).
      border-radius: max(0px, calc(var(--radius) - 4px));

      // Chrome forces the value's colour through `-webkit-text-fill-color`, which plain `color`
      // does not override — against the repainted row that left the text unreadable in dark.
      -webkit-text-fill-color: theme("colors.neutral.950");

      &:disabled {
        box-shadow: 0 0 0 1000px var(--color-neutral-200) inset;
        -webkit-text-fill-color: theme("colors.neutral.500");
        opacity: 0.6;
      }

      &:not(:disabled) {
        box-shadow: 0 0 0 1000px var(--color-additional-50) inset;
      }
    }

    &::placeholder {
      @apply text-neutral-500 font-normal;

      #{$error} & {
        @apply text-danger-500;
      }
    }

    #{$center} & {
      @apply text-center;
    }

    #{$truncate} & {
      @apply truncate;
    }
  }
}
</style>
