<template>
  <label class="inline-flex flex-row items-center space-x-2 cursor-pointer">
    <input
      class="appearance-none rounded-full h-6 w-6 border-2 border-gray-300 bg-white checked:border-8 checked:border-[color:var(--color-primary)] focus:outline-none cursor-pointer"
      type="radio"
      :value="value"
      :checked="checked"
      @change="$emit('update:modelValue', value)"
    />
    <slot v-bind="{ checked, value, label }">
      <span class="text-base font-medium" :class="{ 'text-gray-500': !checked }">{{ label }}</span>
    </slot>
  </label>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
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

const checked = computed(() => props.modelValue == props.value);

defineEmits(["update:modelValue"]);
</script>
