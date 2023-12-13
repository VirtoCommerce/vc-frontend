<template>
  <div v-if="label">
    <span class="font-bold text-gray-900">{{ label }}</span>
    <span v-if="isRequired" class="text-[color:var(--color-danger)]">*</span>
  </div>
  <input
    :value="modelValue"
    :disabled="isDisabled"
    :name="name"
    class="box-border h-11 w-full min-w-0 appearance-none rounded border border-gray-300 bg-white p-3 text-base leading-none outline-none focus:border-gray-400"
    type="date"
    @change="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
  <div v-if="errorMessage" class="text-xs text-[color:var(--color-danger)]">{{ errorMessage }}</div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "update:modelValue", value: string | undefined): void;
}>();

defineProps<IProps>();

interface IProps {
  label?: string;
  name?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  modelValue?: string;
  errorMessage?: string;
}
</script>
