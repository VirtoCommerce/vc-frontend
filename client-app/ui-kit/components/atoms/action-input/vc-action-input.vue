<template>
  <div>
    <p v-if="label" class="pb-2 text-base font-extrabold">{{ label }}</p>
    <div class="flex space-x-3">
      <input
        v-model.trim="value"
        class="h-8 min-w-0 flex-1 rounded border border-gray-300 px-2 text-base leading-8 outline-none focus:border-gray-400"
        type="text"
        :placeholder="placeholder"
        :disabled="isApplied || isDisabled"
        :maxlength="maxLength"
        @keyup.enter="$emit('click:apply')"
      />
      <!-- todo: use VcButton -->
      <button
        v-if="!isApplied"
        class="w-10 flex-none rounded border-2 font-roboto-condensed text-sm font-bold uppercase disabled:cursor-not-allowed disabled:opacity-50"
        :class="[
          value.length === 0
            ? 'border-gray-300 bg-gray-50 text-gray-300'
            : 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white',
        ]"
        :disabled="value.length === 0 || isDisabled"
        @click="$emit('click:apply')"
      >
        <i class="fas fa-check"></i>
      </button>
      <button
        v-if="isApplied"
        class="w-10 rounded border-2 border-[color:var(--color-danger)] font-roboto-condensed text-sm font-bold uppercase text-[color:var(--color-danger)] hover:bg-[color:var(--color-danger)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isDisabled"
        @click="$emit('click:deny')"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div v-if="errorMessage" class="text-xs text-[color:var(--color-danger)]">{{ errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const emit = defineEmits(["update:modelValue", "click:apply", "click:deny"]);
const props = defineProps({
  label: {
    type: String,
    default: undefined,
  },

  placeholder: {
    type: String,
    default: undefined,
  },

  errorMessage: {
    type: String,
    default: undefined,
  },

  isApplied: {
    type: Boolean,
    required: true,
  },

  modelValue: {
    type: String,
    default: "",
  },

  isDisabled: {
    type: Boolean,
    default: false,
  },

  maxLength: {
    type: Number,
    default: undefined,
  },
});
const value = computed({
  get: () => props.modelValue,
  set: (newValue) => emit("update:modelValue", newValue),
});
</script>

<style scoped></style>
