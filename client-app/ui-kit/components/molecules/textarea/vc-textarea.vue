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
    <VcLabel v-if="label" :for="componentId" :required="required" :error="error">
      {{ label }}
    </VcLabel>

    <textarea
      :id="componentId"
      v-model="text"
      :name="name"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      :required="required"
      :maxlength="maxLength"
      :rows="rows"
      :aria-labelledby="componentId"
      class="vc-textarea__input"
    />

    <VcInputDetails
      :show-empty="showEmptyDetails"
      :message="message"
      :error="error"
      :textLength="text.length"
      :max-length="maxLength"
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

const emit = defineEmits<Emits>();

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  rows: 2,
});

const componentId = useComponentId("textarea");
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

      box-shadow: 0 0 0 3px var(--color-primary-light);
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
