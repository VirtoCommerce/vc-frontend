<template>
  <div class="relative">
    <textarea
      v-model="text"
      :rows="rows"
      :maxlength="maxLength"
      class="border rounded-sm w-full p-3 focus:border-gray-400"
      :class="$attrs.class"
    ></textarea>
    <p class="absolute text-xs text-gray-300 bottom-5 right-3">{{ symbolsCount }}</p>
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
  rows: {
    type: Number,
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
});

const emit = defineEmits(["update:modelValue"]);

const text = computed({
  get: () => props.modelValue,
  set: (newValue) => emit("update:modelValue", newValue),
});

const symbolsCount = computed(() => text.value.length + "/" + props.maxLength);
</script>
