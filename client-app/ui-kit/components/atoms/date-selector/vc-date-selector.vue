<template>
  <div v-if="label">
    <span class="font-bold text-gray-900">{{ label }}</span>
    <span v-if="isRequired" class="text-[color:var(--color-danger)]">*</span>
  </div>
  <input
    :value="formatDate"
    :disabled="isDisabled"
    :name="name"
    class="box-border h-11 w-full min-w-0 appearance-none rounded border border-gray-300 bg-white p-3 text-base leading-none outline-none focus:border-gray-400"
    type="date"
    @change="change"
  />
  <div v-if="errorMessage" class="text-xs text-[color:var(--color-danger)]">{{ errorMessage }}</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const emit = defineEmits<{
  (e: "update:modelValue", value: Date | undefined): void;
}>();

const props = defineProps<IProps>();

interface IProps {
  label?: string;
  name?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  modelValue?: Date;
  errorMessage?: string;
}

const formatDate = computed(() => {
  if (!props.modelValue) {
    return "";
  }

  const year = props.modelValue.getFullYear();
  const month = (props.modelValue.getMonth() + 1).toString().padStart(2, "0");
  const day = props.modelValue.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
});

function change(event: Event): void {
  const newValue: string = (event.target as HTMLInputElement).value;
  const dateValue = newValue ? new Date(Date.parse(newValue)) : undefined;
  emit("update:modelValue", dateValue);
}
</script>
