<template>
  <div
    :class="[
      'vc-textarea',
      {
        'vc-textarea--disabled': disabled,
        'vc-textarea--no-resize': noResize,
        'vc-textarea--error': error,
      },
      $attrs.class,
    ]"
  >
    <VcLabel v-if="label" :forId="componentId" :required="required" :error="error">
      {{ label }}
    </VcLabel>

    <textarea
      v-model="text"
      :id="componentId"
      :name="name"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      :required="required"
      :autofocus="autofocus"
      :maxlength="maxLength"
      :rows="rows"
      class="vc-textarea__input"
    />

    <VcInputDetails
      :showEmpty="showEmptyDetails"
      :error="error"
      :message="message"
      :counter="counter"
      :textLength="text.length"
      :maxLength="maxLength"
    />
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { useComponentId } from "@/core/composables";

interface Props {
  modelValue: string;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
  autofocus?: boolean;
  name?: string;
  label?: string;
  placeholder?: string;
  message?: string;
  error?: boolean;
  counter?: boolean;
  noResize?: boolean;
  showEmptyDetails?: boolean;
  maxLength?: number | string;
  rows?: number | string;
}

interface Emits {
  (event: "update:modelValue", value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  rows: 2,
});

const emit = defineEmits<Emits>();

const componentId = useComponentId("textarea-");
const text = useVModel(props, "modelValue", emit);
</script>

<style lang="scss">
.vc-textarea {
  $disabled: "";
  $noResize: "";
  $error: "";

  @apply flex flex-col text-[color:var(--color-body-text)];

  &--disabled {
    $disabled: &;
  }

  &--no-resize {
    $noResize: &;
  }

  &--error {
    $error: &;
  }

  &__label {
    @apply text-15 font-bold;

    #{$error} & {
      @apply text-[color:var(--color-danger)];
    }
  }

  &__asterisk {
    @apply text-[color:var(--color-danger)];
  }

  &__input {
    @apply p-3 w-full rounded border text-15 font-medium bg-white;

    #{$noResize} & {
      @apply resize-none;
    }

    &:focus,
    &:focus-visible {
      @apply outline-none;

      box-shadow: 0 0 0 2px var(--color-primary-light);
    }

    &[disabled],
    #{$disabled} & {
      @apply bg-gray-100 cursor-not-allowed;
    }

    #{$error} & {
      @apply border-[color:var(--color-danger)];
    }
  }
}
</style>
