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
        'vc-input--center': center,
        'vc-input--truncate': truncate,
      },
    ]"
    v-bind="attrs"
    tabindex="-1"
    role="button"
    @keyup="handleContainerClick"
    @click="handleContainerClick"
  >
    <VcLabel v-if="label" :for-id="componentId" :required="required" :error="error">
      {{ label }}
    </VcLabel>

    <div class="vc-input__container">
      <div v-if="$slots.prepend" class="vc-input__decorator">
        <slot name="prepend" />
      </div>

      <input
        :id="componentId"
        ref="inputElement"
        v-model="inputValue"
        v-bind="listeners"
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
        :autocomplete="autocomplete"
        :aria-label="ariaLabel ?? label"
        class="vc-input__input"
      />

      <div v-if="clearable && inputValue && !disabled && !readonly" class="vc-input__decorator">
        <button type="button" tabindex="-1" class="vc-input__clear" @click.stop="clear">
          <VcIcon name="delete-mini" :size="16" />
        </button>
      </div>

      <div v-if="type === 'password' && !hidePasswordSwitcher" class="vc-input__decorator">
        <button
          :disabled="disabled"
          :aria-label="$t('common.buttons.show_hide_password')"
          tabindex="-1"
          type="button"
          class="vc-input__password-icon"
          @click="togglePasswordVisibility"
        >
          <VcIcon :name="passwordVisibilityIcon" />
        </button>
      </div>

      <div v-if="$slots.append" class="vc-input__decorator">
        <slot name="append" />
      </div>

      <div class="vc-input__bg"></div>
    </div>

    <VcInputDetails :show-empty="showEmptyDetails" :message="message" :error="error" :single-line="singleLineMessage" />
  </div>
</template>

<script setup lang="ts" generic="T extends string | number | null">
import { computed, ref, watchEffect } from "vue";
import { useAttrsOnly, useComponentId, useListeners } from "@/ui-kit/composables";

export interface IEmits<T> {
  (event: "update:modelValue", value?: T): void;
}

export interface IProps<T> {
  modelValue?: T;
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
  error?: boolean;
  noBorder?: boolean;
  hidePasswordSwitcher?: boolean;
  showEmptyDetails?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  minlength?: string | number;
  maxlength?: string | number;
  center?: boolean;
  truncate?: boolean;
  type?: "text" | "password" | "number" | "email";
  size?: "sm" | "md" | "auto";
  clearable?: boolean;
}

defineOptions({
  inheritAttrs: false,
});

const emit = defineEmits<IEmits<T>>();
const props = withDefaults(defineProps<IProps<T>>(), {
  type: "text",
  size: "md",
  modelModifiers: () => ({}),
});

const componentId = useComponentId("input");
const listeners = useListeners();
const attrs = useAttrsOnly();

const inputElement = ref<HTMLElement>();
const inputType = ref("");
const isPasswordVisible = ref(false);
const isNumberTypeSafari = ref(false);

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (props.disabled) {
      return;
    }

    if (props.type === "number") {
      emit("update:modelValue", value !== undefined && value !== "" ? (Number(value) as T) : undefined);
    } else {
      emit("update:modelValue", value);
    }
  },
});

const minValue = computed(() => (props.type === "number" ? props.min : undefined));
const maxValue = computed(() => (props.type === "number" ? props.max : undefined));
const stepValue = computed(() => (props.type === "number" ? props.step : undefined));

const passwordVisibilityIcon = computed<string>(() => (isPasswordVisible.value ? "eye-off" : "eye"));

function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value;
  inputType.value = isPasswordVisible.value ? "text" : "password";
}

function handleContainerClick() {
  if (inputElement.value) {
    inputElement.value.focus();
    inputElement.value.click();
  }
}

function clear() {
  emit("update:modelValue", undefined);
  inputElement.value?.focus();
}

watchEffect(() => {
  let type = props.type;

  // Safari has bug for number input
  if (typeof window !== "undefined" || typeof document !== "undefined") {
    const ua = navigator.userAgent.toLocaleLowerCase();

    if (type === "number" && ua.includes("safari") && !ua.includes("chrome")) {
      isNumberTypeSafari.value = true;
      type = "text";
    }
  }

  inputType.value = type;
});

watchEffect(() => {
  if (!isNumberTypeSafari.value) {
    return;
  }

  if (isNaN(props.modelValue as number)) {
    emit("update:modelValue", null as T);
  }
});
</script>

<style lang="scss">
.vc-input {
  $sizeSm: "";
  $sizeMd: "";

  $readonly: "";
  $disabled: "";
  $error: "";
  $noBorder: "";
  $center: "";
  $truncate: "";

  @apply flex flex-col;

  &--size {
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
  }

  &--no-border {
    $noBorder: &;
  }

  &--center {
    $center: &;
  }

  &--truncate {
    $truncate: &;
  }

  &__container {
    @apply z-0 relative flex items-stretch select-none;

    #{$sizeSm} & {
      @apply h-9 text-sm;
    }

    #{$sizeMd} & {
      @apply h-11 text-base;
    }

    #{$disabled} &,
    &:disabled {
      @apply cursor-not-allowed;
    }
  }

  &__decorator {
    @apply flex items-center h-full;

    &:first-child > * {
      @apply rounded-r-none;
    }

    #{$disabled} &,
    &:disabled {
      @apply cursor-not-allowed;
    }

    &:nth-last-child(-n + 2) > * {
      @apply rounded-l-none;
    }

    & > * {
      @apply max-h-full;
    }
  }

  &__input {
    @apply relative m-px px-3 appearance-none bg-transparent rounded-[3px] leading-none w-full min-w-0;

    &:autofill {
      &:disabled {
        box-shadow: 0 0 0 1000px #f9fafb inset;
      }

      &:not(:disabled) {
        box-shadow: 0 0 0 1000px #fff inset;
      }
    }

    &:focus {
      @apply outline-none;
    }

    #{$disabled} &,
    &:disabled {
      @apply text-[--color-neutral-600] cursor-not-allowed;
    }

    &::placeholder {
      #{$error} & {
        @apply opacity-80 text-[--color-danger-500];
      }
    }

    #{$center} & {
      @apply text-center;
    }

    #{$truncate} & {
      @apply truncate;
    }

    #{$error} & {
      @apply text-[--color-danger-500];
    }
  }

  &__clear {
    @apply flex items-center p-3 text-[--color-primary-500];
  }

  &__bg {
    @apply content-[''] z-[-1] absolute inset-0 bg-[--color-additional-50] border rounded;

    input:focus ~ & {
      @apply ring ring-[--color-primary-100];
    }

    #{$disabled} &,
    input:disabled ~ & {
      @apply bg-[--color-neutral-50];
    }

    #{$error} & {
      @apply border-[--color-danger-500];
    }

    #{$noBorder} & {
      @apply border-none;
    }
  }

  &__password-icon {
    @apply h-full px-3 text-[--color-primary-500];

    #{$disabled} & {
      @apply text-[--color-neutral-300] cursor-not-allowed;
    }
  }
}
</style>
