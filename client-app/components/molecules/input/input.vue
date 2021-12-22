<template>
  <div>
    <div>
      <span class="font-bold text-gray-900">{{ label }}</span>
      <span v-if="isRequired" class="text-red-500">*</span>
    </div>
    <input
      class="appearance-none rounded px-3 py-3 text-base leading-none box-border border border-gray-300 w-full outline-none focus:border-gray-400"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <div v-if="errorMessage" class="text-xs text-red-500">{{ errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  label: {
    type: String,
    required: true,
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
    type: String,
    default: "",
  },

  placeholder: {
    type: String,
    default: "",
  },

  type: {
    type: String,
    default: "text",
  },

  errorMessage: {
    type: String,
    default: undefined,
  },
});

defineEmits(["update:modelValue"]);
</script>
