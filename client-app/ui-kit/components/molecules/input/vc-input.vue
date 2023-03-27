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
        class="vc-input__input"
        :value="modelValue"
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
        @input="change"
        @click="emit('click', $event)"
        @keypress="emit('keypress', $event)"
        @blur="emit('blur', $event)"
      />

      <div v-if="type === 'password' && !hidePasswordSwitcher" class="vc-input__decorator">
        <button
          tabindex="-1"
          type="button"
          class="h-full px-3 text-[color:var(--color-primary)] disabled:text-gray-300"
          :disabled="disabled"
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

    <VcInputDetails :show-empty="showEmptyDetails" :message="message" :error="error" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useComponentId } from "@/core/composables";

interface IProps {
  autocomplete?: string;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
  noBorder?: boolean;
  hidePasswordSwitcher?: boolean;
  label?: string;
  name?: string;
  placeholder?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  minlength?: string | number;
  maxlength?: string | number;
  error?: boolean;
  center?: boolean;
  truncate?: boolean;
  message?: string;
  modelValue?: string | number;
  type?: "text" | "password" | "number";
  size?: "sm" | "md";
  showEmptyDetails?: boolean;
}

interface IEmits {
  (event: "update:modelValue", value?: string | number): void;
  (event: "click", value: MouseEvent): void;
  (event: "keypress", value: KeyboardEvent): void;
  (event: "blur", value: Event): void;
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  type: "text",
  size: "md",
});

const componentId = useComponentId("input");

const inputType = ref("");
const isPasswordVisible = ref(false);
const isNumberTypeSafari = ref(false);

const minValue = computed(() => (props.type === "number" ? props.min : undefined));
const maxValue = computed(() => (props.type === "number" ? props.max : undefined));
const stepValue = computed(() => (props.type === "number" ? props.step : undefined));

const passwordVisibilityIcon = computed<string>(() => (isPasswordVisible.value ? "eye-off" : "eye"));

function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value;
  inputType.value = isPasswordVisible.value ? "text" : "password";
}

function change(event: Event) {
  if (props.disabled) {
    return;
  }
  const value: string = (event.target as HTMLInputElement).value;

  emit("update:modelValue", props.type === "number" ? Number(value) : value);
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
    emit("update:modelValue");
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

  &--disabled {
    $disabled: &;
  }

  &--readonly {
    $readonly: &;
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
    @apply z-0 relative flex items-stretch p-px select-none;

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

    &:first-child {
      @apply rounded-l-[3px];
    }

    &:nth-last-child(-n + 2) {
      @apply rounded-r-[3px];
    }

    & > * {
      @apply max-h-full;
    }
  }

  &__input {
    @apply relative px-3 appearance-none bg-transparent rounded-[3px] text-15 leading-none w-full min-w-0;

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

    &:disabled {
      @apply text-gray-400;
    }

    &::placeholder {
      #{$error} & {
        @apply opacity-80 text-[color:var(--color-danger)];
      }
    }

    #{$center} & {
      @apply text-center;
    }

    #{$truncate} & {
      @apply truncate;
    }

    #{$error} & {
      @apply text-[color:var(--color-danger)];
    }
  }

  &__bg {
    @apply content-[''] z-[-1] absolute inset-0 bg-white border rounded;

    input:focus ~ & {
      @apply ring ring-[color:var(--color-primary-light)];

      #{$readonly} & {
        @apply ring-transparent;
      }
    }

    #{$disabled} &,
    input:disabled ~ & {
      @apply bg-gray-50;
    }

    #{$error} & {
      @apply border-[color:var(--color-danger)];
    }

    #{$noBorder} & {
      @apply border-none;
    }
  }
}
</style>
