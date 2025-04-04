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
    @keyup="handleContainerClick($event)"
    @click="handleContainerClick($event)"
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
        :data-test-id="testIdInput"
        @keydown="keyDown($event)"
        @click.prevent.stop="inputClick()"
      />

      <div v-if="clearable && model && !disabled && !readonly" class="vc-input__decorator">
        <VcButton
          :disabled="disabled"
          type="button"
          icon="delete-thin"
          color="neutral"
          variant="no-background"
          class="vc-input__clear"
          :icon-size="size === 'md' ? '0.875rem' : '0.75rem'"
          @click.stop="clear"
        />
      </div>

      <div v-if="type === 'password' && !hidePasswordSwitcher" class="vc-input__decorator">
        <VcButton
          :disabled="disabled"
          :aria-label="$t('ui_kit.buttons.show_hide_password')"
          type="button"
          :icon="passwordVisibilityIcon"
          variant="no-border"
          :icon-size="size === 'md' ? '1.5rem' : '1.25rem'"
          class="vc-input__password-button"
          @click="togglePasswordVisibility"
        />
      </div>

      <div v-if="$slots.append" class="vc-input__decorator">
        <slot name="append" />
      </div>
    </div>

    <VcInputDetails :show-empty="showEmptyDetails" :message="message" :error="error" :single-line="singleLineMessage" />
  </div>
</template>

<script setup lang="ts" generic="T extends string | number | null">
import { provide, computed, ref } from "vue";
import { useAttrsOnly, useComponentId, useListeners } from "@/ui-kit/composables";

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
  type?: "text" | "password" | "number" | "email" | "search";
  size?: "xs" | "sm" | "md" | "auto";
  clearable?: boolean;
  browserTooltip?: "enabled" | "disabled";
  selectOnClick?: boolean;
  testIdInput?: string;
}

interface IEmits {
  (event: "clear"): void;
}

defineOptions({
  inheritAttrs: false,
});

const emit = defineEmits<IEmits>();

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

const _size = computed(() => props.size);

const minValue = computed(() => (props.type === "number" ? props.min : undefined));
const maxValue = computed(() => (props.type === "number" ? props.max : undefined));
const stepValue = computed(() => (props.type === "number" ? props.step : undefined));

const isPasswordVisible = ref<boolean>(false);
const passwordVisibilityIcon = computed<string>(() => (isPasswordVisible.value ? "eye-off" : "eye"));

function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value;
}

function handleContainerClick(event: Event) {
  if (event instanceof KeyboardEvent && event.key === "Tab") {
    return;
  }

  if (inputElement.value) {
    inputElement.value.focus();
  }
}

function clear() {
  model.value = undefined;
  inputElement.value?.focus();
  emit("clear");
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

provide<VcInputContextType>("inputContext", {
  size: _size,
});
</script>

<style lang="scss">
.vc-input {
  $sizeXs: "";
  $sizeSm: "";
  $sizeMd: "";

  $readonly: "";
  $disabled: "";
  $error: "";
  $noBorder: "";
  $center: "";
  $truncate: "";

  --color: var(--vc-input-base-color, theme("colors.primary.500"));
  --focus-color: rgb(from var(--color) r g b / 0.2);

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

  &--center {
    $center: &;
  }

  &--truncate {
    $truncate: &;
  }

  &__container {
    @apply flex items-stretch p-0.5 border border-neutral-400 rounded bg-additional-50 select-none;

    #{$sizeXs} & {
      @apply h-8 text-sm;
    }

    #{$sizeSm} & {
      @apply h-[2.375rem] text-sm;
    }

    #{$sizeMd} & {
      @apply h-11 text-base;
    }

    &:has(input:focus) {
      @apply ring ring-[--focus-color];
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
  }

  &__decorator {
    @apply flex-none flex items-center max-w-[50%] h-full;

    #{$disabled} &,
    &:disabled {
      @apply cursor-not-allowed;
    }
  }

  &__input {
    @apply relative m-px px-2 appearance-none bg-transparent rounded-[3px] leading-none w-full min-w-0;

    &::-webkit-search-cancel-button {
      @apply appearance-none;
    }

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
      @apply text-neutral-500 cursor-not-allowed;
    }

    &::placeholder {
      @apply text-neutral-400;

      #{$error} & {
        @apply text-danger-400;
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
