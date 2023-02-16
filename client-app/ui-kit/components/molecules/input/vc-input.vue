<template>
  <div
    :class="[
      'vc-input',
      `vc-input--size--${size}`,
      {
        'vc-input--disabled': disabled,
        'vc-input--readonly': readonly,
        'vc-input--hide-empty-details': !showEmptyDetails,
        'vc-input--error': error,
      },
    ]"
  >
    <VcLabel v-if="label" :required="required">{{ label }}</VcLabel>

    <div class="vc-input__container">
      <div class="vc-input__decorator" v-if="$slots.startDecorator">
        <slot name="startDecorator" />
      </div>

      <input
        class="vc-input__input"
        :value="modelValue"
        :type="inputType"
        :name="name"
        :placeholder="placeholder"
        :readonly="readonly"
        :disabled="disabled"
        :autofocus="autofocus"
        :min="minValue"
        :max="maxValue"
        :minlength="minlength"
        :maxlength="maxlength"
        :step="stepValue"
        :autocomplete="autocomplete"
        @input="change"
      />

      <div class="vc-input__decorator" v-if="$slots.endDecorator">
        <slot name="endDecorator" />
      </div>

      <div class="vc-input__bg"></div>
    </div>

    <!-- Details -->
    <div class="vc-input__details">
      <!-- Message -->
      <div v-if="message" class="vc-input__message" v-html="message"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";

interface Props {
  autofocus?: boolean;
  autocomplete?: string;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
  noBorder?: boolean;
  label?: string;
  name?: string;
  placeholder?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  minlength?: string | number;
  maxlength?: string | number;
  modelValue?: string | number;
  type?: "text" | "password" | "number";
  size?: "sm" | "md";
  showEmptyDetails?: boolean;
  error?: boolean;
  message?: string;
}

interface Emits {
  (event: "update:modelValue", value?: string | number): void;
}

const emit = defineEmits<Emits>();
const props = withDefaults(defineProps<Props>(), {
  type: "text",
  size: "md",
});

const inputType = ref("");
const isNumberTypeSafari = ref(false);

const minValue = computed(() => (props.type === "number" ? props.min : undefined));
const maxValue = computed(() => (props.type === "number" ? props.max : undefined));
const stepValue = computed(() => (props.type === "number" ? props.step : undefined));

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

<style scoped lang="scss">
.vc-input {
  $sizeSm: "";
  $sizeMd: "";

  $readonly: "";
  $disabled: "";
  $hideEmptyDetails: "";
  $error: "";
  $noBorder: "";

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

  &--hide-empty-details {
    $hideEmptyDetails: &;
  }

  &--error {
    $error: &;
  }

  &--no-border {
    $noBorder: &;
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
    @apply flex items-stretch max-h-full;
  }

  &__input {
    @apply relative px-3 appearance-none bg-transparent rounded text-base leading-none w-full outline-none min-w-0;

    &:autofill {
      box-shadow: 0 0 0px 1000px #fff inset;
    }
  }

  &__bg {
    @apply content-[''] z-[-1] absolute inset-0 bg-white border rounded;

    input:focus ~ & {
      box-shadow: 0 0 0 2px var(--color-primary-light);
    }

    #{$disabled} &,
    &:disabled {
      @apply bg-gray-50;
    }

    #{$noBorder} & {
      @apply border-none;
    }
  }

  &__details {
    @apply flex justify-end mt-0.5 gap-2 min-h-[0.875rem] text-11;

    #{$hideEmptyDetails} & {
      @apply empty:hidden;
    }
  }

  &__message {
    @apply grow text-gray-400;

    #{$error} & {
      @apply text-[color:var(--color-danger)];
    }
  }
}
</style>
