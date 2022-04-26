<template>
  <div v-if="label">
    <span class="font-bold text-gray-900">{{ label }}</span>
    <span v-if="isRequired" class="text-[color:var(--color-danger)]">*</span>
  </div>
  <input
    class="appearance-none h-11 rounded px-3 py-3 text-base leading-none box-border border border-gray-300 w-full outline-none focus:border-gray-400 min-w-0"
    type="date"
    :value="inputValue"
    :disabled="isDisabled"
    :autofocus="autofocus"
    :name="name"
    @change="change"
  />
  <div v-if="errorMessage" class="text-xs text-[color:var(--color-danger)]">{{ errorMessage }}</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  autofocus: Boolean,
  label: {
    type: String,
    default: undefined,
  },
  name: {
    type: String,
    default: undefined,
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: Date,
    default: undefined,
  },

  errorMessage: {
    type: String,
    default: undefined,
  },
});

// convert input value to string format yyyy-MM-dd
const inputValue = computed(() => props.modelValue?.toISOString()?.substring(0, 10));

const emit = defineEmits<{
  (e: "update:modelValue", value: Date | undefined): void;
  (e: "change", value: Date | undefined): void;
}>();

function change(event: Event) {
  const newValue: string = (event.target as HTMLInputElement).value;
  const dateValue = newValue ? new Date(Date.parse(newValue)) : undefined;
  emit("update:modelValue", dateValue);
  emit("change", dateValue);
}
</script>
