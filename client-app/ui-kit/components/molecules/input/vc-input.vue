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
        v-model="model"
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
        :title="browserTooltip === 'enabled' ? message : ''"
        class="vc-input__input"
        :data-testid="testId"
        @keydown="keyDown($event)"
        @click.prevent.stop="inputClick()"
      />

      <div v-if="clearable && model && !disabled && !readonly" class="vc-input__decorator">
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
    </div>

    <VcInputDetails :show-empty="showEmptyDetails" :message="message" :error="error" :single-line="singleLineMessage" />
  </div>
</template>

<script setup lang="ts" generic="T extends string | number | null">
import { computed, ref } from "vue";
import { useAttrsOnly, useComponentId, useListeners } from "@/ui-kit/composables";

export interface IProps {
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
  browserTooltip?: "enabled" | "disabled";
  selectOnClick?: boolean;
  testId?: string;
}

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<IProps>(), {
  type: "text",
  size: "md",
  browserTooltip: "disabled",
});

const componentId = useComponentId("input");
const listeners = useListeners();
const attrs = useAttrsOnly();

const inputElement = ref<HTMLInputElement>();
const inputType = computed(() => (props.type === "password" && isPasswordVisible.value ? "text" : props.type));

const model = defineModel<T>({
  set(value) {
    if (props.disabled) {
      return;
    }

    return !(props.type === "number" && value === "") ? value : undefined;
  },
});

const minValue = computed(() => (props.type === "number" ? props.min : undefined));
const maxValue = computed(() => (props.type === "number" ? props.max : undefined));
const stepValue = computed(() => (props.type === "number" ? props.step : undefined));

const isPasswordVisible = ref<boolean>(false);
const passwordVisibilityIcon = computed<string>(() => (isPasswordVisible.value ? "eye-off" : "eye"));

function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value;
}

function handleContainerClick() {
  if (inputElement.value) {
    inputElement.value.focus();
  }
}

function clear() {
  model.value = undefined;
  inputElement.value?.focus();
}

// Workaround to fix Safari bug
function keyDown(event: KeyboardEvent) {
  if (props.type === "number") {
    const allowedCharacter = /(^\d*$)|(Backspace|Tab|Delete|ArrowLeft|ArrowRight)/;

    return !event.key.match(allowedCharacter) && event.preventDefault();
  }
}

function inputClick() {
  if (inputElement.value && props.selectOnClick) {
    inputElement.value.select();
  }
}
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
    @apply flex items-stretch border rounded bg-additional-50 select-none;

    #{$sizeSm} & {
      @apply h-9 text-sm;
    }

    #{$sizeMd} & {
      @apply h-11 text-base;
    }

    &:has(input:focus) {
      @apply ring ring-primary-100;

      #{$error} & {
        @apply ring-danger-100;
      }
    }

    #{$disabled} &,
    &:has(input:disabled) {
      @apply bg-neutral-50 cursor-not-allowed;
    }

    #{$error} & {
      @apply border-danger;
    }

    #{$noBorder} & {
      @apply border-none;
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
      @apply text-neutral-600 cursor-not-allowed;
    }

    &::placeholder {
      #{$error} & {
        @apply opacity-80 text-danger;
      }
    }

    #{$center} & {
      @apply text-center;
    }

    #{$truncate} & {
      @apply truncate;
    }

    #{$error} & {
      @apply text-danger;
    }
  }

  &__clear {
    @apply flex items-center p-3 text-primary;
  }

  &__password-icon {
    @apply h-full px-3 text-primary;

    #{$disabled} & {
      @apply text-neutral-300 cursor-not-allowed;
    }
  }
}
</style>
