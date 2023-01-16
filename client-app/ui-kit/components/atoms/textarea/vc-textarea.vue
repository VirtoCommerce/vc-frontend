<template>
  <div
    :class="[
      'vc-textarea',
      {
        'vc-textarea--disabled': disabled,
        'vc-textarea--no-resize': noResize,
        'vc-textarea--hide-empty-details': !showEmptyDetails,
        'vc-textarea--error': error,
      },
      $attrs.class,
    ]"
  >
    <label v-if="label" :for="componentId" class="vc-textarea__label">
      {{ label }}

      <span v-if="required" class="vc-textarea__asterisk">*</span>
    </label>

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

    <!-- Details -->
    <div class="vc-textarea__details">
      <!-- Message -->
      <div v-if="message" class="vc-textarea__message" v-html="message"></div>

      <!-- Counter -->
      <div v-if="counter" class="vc-textarea__counter">
        {{ text.length }}<template v-if="maxLength"> / {{ maxLength }}</template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useComponentId } from "@/core/composables";

const props = defineProps({
  readonly: Boolean,
  disabled: Boolean,
  required: Boolean,
  autofocus: Boolean,
  name: String,
  label: String,
  placeholder: String,
  message: String,
  error: Boolean,
  counter: Boolean,
  maxLength: [Number, String],
  noResize: Boolean,
  showEmptyDetails: Boolean,

  modelValue: {
    type: String,
    default: "",
  },

  rows: {
    type: [Number, String],
    default: 2,
  },
});

const emit = defineEmits(["update:modelValue"]);

const componentId = useComponentId("textarea-");

const text = computed<string>({
  get: () => props.modelValue,
  set: (newValue) => emit("update:modelValue", newValue),
});
</script>

<style lang="scss">
.vc-textarea {
  $disabled: "";
  $noResize: "";
  $hideEmptyDetails: "";
  $error: "";

  @apply flex flex-col gap-1 text-[color:var(--color-body-text)];

  &--disabled {
    $disabled: &;
  }

  &--no-resize {
    $noResize: &;
  }

  &--hide-empty-details {
    $hideEmptyDetails: &;
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

    &:focus {
      @apply outline outline-offset-0 outline-2 outline-[color:var(--color-primary-light)];
    }

    &[disabled],
    #{$disabled} & {
      @apply bg-gray-100 cursor-not-allowed;
    }

    #{$error} & {
      @apply border-[color:var(--color-danger)];
    }
  }

  &__details {
    @apply flex justify-end gap-2 min-h-[0.875rem] text-11;

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

  &__counter {
    @apply font-medium text-right;
  }
}
</style>
