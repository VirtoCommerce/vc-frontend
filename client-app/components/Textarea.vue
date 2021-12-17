<template>
  <div class="relative">
    <textarea
      v-model="text"
      :rows="rows"
      :maxlength="maxLength"
      class="border rounded-sm w-full p-3"
      :class="resizeClass"
    ></textarea>
    <p class="absolute text-xs text-gray-300 bottom-5 right-3">{{ symbolsCount }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
const props = defineProps({
  rows: {
    type: Number,
    required: true,
  },

  maxLength: {
    type: Number,
    required: true,
  },

  modelValue: {
    type: String,
    default: "",
  },

  resizeClass: {
    type: String,
    default: "",
  },
});
const maxLength = toRef(props, "maxLength");
//const textarea = toRef(props, "modelValue");
const text = computed({
  get: () => props.modelValue,
  set: (newValue) => emit("update:modelValue", newValue),
});
const symbolsCount = computed(() => text.value.length + "/" + maxLength.value);
// const onInput = (e: Event) => {
//   const newValue = (e.target as HTMLInputElement).value;
//   emit("update:modelValue", newValue);
// };
const emit = defineEmits(["update:modelValue"]);
</script>

<style scoped></style>
