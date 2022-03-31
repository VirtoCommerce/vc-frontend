<template>
  <div>
    <p v-if="label" class="text-base pb-2 font-extrabold">{{ label }}</p>
    <div class="flex space-x-3">
      <input
        v-model="value"
        class="border rounded text-base leading-8 flex-1 border-gray-300 h-8 px-2 outline-none focus:border-gray-400 min-w-0"
        type="text"
        :placeholder="placeholder"
        :disabled="isApplied || isDisabled"
        :maxlength="maxLength"
      />
      <!-- todo: use VcButton -->
      <button
        v-if="!isApplied"
        class="rounded uppercase flex-none w-10 border-2 font-roboto-condensed font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
        class="rounded uppercase w-10 border-2 font-roboto-condensed font-bold text-sm text-[color:var(--color-danger)] border-[color:var(--color-danger)] hover:text-white hover:bg-[color:var(--color-danger)] disabled:opacity-50 disabled:cursor-not-allowed"
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
const emit = defineEmits(["update:modelValue", "click:apply", "click:deny"]);
</script>

<style scoped></style>
