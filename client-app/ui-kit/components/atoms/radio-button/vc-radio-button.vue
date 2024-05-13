<template>
  <label class="inline-flex cursor-pointer flex-row items-center space-x-2">
    <input
      class="size-6 cursor-pointer appearance-none rounded-full border-2 border-neutral-300 bg-additional-50 checked:border-8 checked:border-primary focus:outline-none"
      type="radio"
      :value="value"
      :checked="checked"
      :aria-checked="checked"
      @change="$emit('update:modelValue', value)"
    />
    <slot v-bind="{ checked, value, label }">
      <span class="text-base font-normal" :class="{ 'text-neutral-500': !checked }">{{ label }}</span>
    </slot>
  </label>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineEmits(["update:modelValue"]);

const props = defineProps({
  label: {
    type: String,
    default: "",
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

const checked = computed(() => props.modelValue === props.value);
</script>
