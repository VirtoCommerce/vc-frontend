<template>
  <div class="flex flex-row items-center space-x-2">
    <input
      :id="id"
      class="appearance-none rounded-full h-6 w-6 border-2 border-gray-300 bg-white checked:border-8 checked:border-yellow-500 focus:outline-none cursor-pointer"
      type="radio"
      :value="value"
      :checked="isChecked"
      @change="$emit('update:modelValue', value)"
    />
    <label :for="id" class="text-base font-medium" :class="{ 'text-gray-500': !isChecked }">{{ label }}</label>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    default: undefined,
  },
});

const isChecked = computed(() => props.modelValue == props.value);

defineEmits(["update:modelValue"]);
</script>
