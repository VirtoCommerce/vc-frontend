<template>
  <div
    :class="[
      'vc-textarea',
      {
        'vc-textarea--readonly': readonly,
        'vc-textarea--disabled': disabled,
        'vc-textarea--no-resize': noResize,
        'vc-textarea--error': error,
      },
    ]"
    v-bind="attrs"
  >
    <VcLabel v-if="label" :for="componentId" :required="required" :error="error">
      {{ label }}
    </VcLabel>

    <textarea
      :id="componentId"
      v-model="text"
      v-bind="listeners"
      :name="name"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      :required="required"
      :maxlength="maxLength"
      :rows="rows"
      :aria-labelledby="componentId"
      :autocomplete="autocomplete"
      class="vc-textarea__input"
    />

    <VcInputDetails
      :show-empty="showEmptyDetails"
      :counter="counter"
      :message="message"
      :error="error"
      :textLength="text?.length"
      :max-length="maxLength"
      :single-line="singleLineMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { useAttrsOnly, useComponentId, useListeners } from "@/ui-kit/composables";

interface IEmits {
  (event: "update:modelValue", value: string): void;
}

interface IProps {
  modelValue?: string;
  modelModifiers?: Record<string, boolean>;
  autocomplete?: string;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  label?: string;
  placeholder?: string;
  message?: string;
  singleLineMessage?: boolean;
  error?: boolean;
  counter?: boolean;
  noResize?: boolean;
  showEmptyDetails?: boolean;
  maxLength?: number | string;
  rows?: number | string;
}

defineOptions({
  inheritAttrs: false,
});

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  modelModifiers: () => ({}),
  rows: 2,
});

const componentId = useComponentId("textarea");
const listeners = useListeners();
const attrs = useAttrsOnly();
const text = useVModel(props, "modelValue", emit);
</script>

<style lang="scss">
.vc-textarea {
  $readonly: "";
  $disabled: "";
  $noResize: "";
  $error: "";

  @apply flex flex-col text-[color:var(--color-body-text)];

  &--readonly {
    $readonly: &;
  }

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
      @apply outline-none ring ring-[color:var(--color-primary-light)];
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
