<template>
  <div
    :class="[
      'vc-textarea',
      {
        'vc-textarea--error': error,
        'vc-textarea--no-resize': noResize,
        'vc-textarea--hide-empty-details': !showEmptyDetails,
      },
    ]"
  >
    <label v-if="label" :for="componentId" class="vc-textarea__label">
      {{ label }}

      <span v-if="required" class="vc-textarea__asterisk">*</span>
    </label>

    <textarea
      class="vc-textarea__input"
      v-model="text"
      :id="componentId"
      :rows="rows"
      :maxlength="maxLength"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
    />

    <!-- Details -->
    <div class="vc-textarea__details">
      <!-- Message -->
      <div v-if="message" class="vc-textarea__message" v-html="message"></div>

      <!-- Counter -->
      <div v-if="counter" class="vc-textarea__counter">{{ text.length }}/{{ maxLength }}</div>
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

const componentId = useComponentId("textarea-");

const props = defineProps({
  counter: Boolean,
  disabled: Boolean,
  required: Boolean,
  error: Boolean,
  noResize: Boolean,
  showEmptyDetails: Boolean,

  rows: {
    type: [Number, String],
    default: 2,
  },

  maxLength: {
    type: Number,
    default: 999999,
  },

  modelValue: {
    type: String,
    default: "",
  },

  placeholder: {
    type: String,
    default: "",
  },

  label: {
    type: String,
    default: "",
  },

  message: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const text = computed<string>({
  get: () => props.modelValue,
  set: (newValue) => emit("update:modelValue", newValue),
});
</script>

<style lang="scss">
.vc-textarea {
  $error: "";
  $hideEmptyDetails: "";
  $noResize: "";

  @apply flex flex-col gap-1 text-[color:var(--color-body-text)];

  &--error {
    $error: &;
  }

  &--hide-empty-details {
    $hideEmptyDetails: &;
  }

  &--no-resize {
    $noResize: &;
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

    &[disabled] {
      @apply bg-gray-100;
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
