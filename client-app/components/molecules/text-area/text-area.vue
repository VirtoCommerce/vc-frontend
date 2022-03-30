<template>
  <div class="relative">
    <textarea
      v-model="text"
      :rows="rows"
      :maxlength="maxLength"
      :placeholder="placeholder"
      :disabled="isDisabled"
      class="rounded w-full leading-tight p-3 border focus:border-gray-400 outline-none"
      :class="$attrs.class"
    />
    <p v-if="counter" class="absolute text-xs text-gray-300 bottom-3.5 right-3">{{ symbolsCount }}</p>
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  counter: Boolean,
  isDisabled: Boolean,

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
});

const emit = defineEmits(["update:modelValue"]);

const text = computed<string>({
  get: () => props.modelValue,
  set: (newValue) => emit("update:modelValue", newValue),
});

const symbolsCount = computed(() => text.value.length + "/" + props.maxLength);
</script>
